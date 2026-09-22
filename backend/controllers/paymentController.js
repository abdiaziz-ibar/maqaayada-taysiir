const prisma = require("../lib/prisma");
const { generateReceiptNumber } = require("../utils/receipt");
const { withSafeParent } = require("../utils/serialize");
const { logAudit } = require("../utils/auditLog");

const billStatus = (amountDue, amountPaid) => {
  if (amountPaid <= 0) return "unpaid";
  if (amountPaid >= amountDue) return "paid";
  return "partial";
};

// POST /api/payments  { parentId, amount, method, reference?, notes?, allocations: [{invoiceId, amount}] }
// A single payment can be split across several of the parent's invoices
// (possibly for different children) — spec §16's "Student(s)" + partial
// payment requirement.
const createPayment = async (req, res, next) => {
  try {
    const { parentId, amount, method, reference, notes, allocations } = req.body;
    const amt = Number(amount);
    if (!parentId) return res.status(400).json({ message: "Waalidka waa waajib." });
    if (!amt || amt <= 0) return res.status(400).json({ message: "Qadarka lacagta waa waajib." });
    if (!method) return res.status(400).json({ message: "Habka lacag bixinta waa waajib." });
    if (!Array.isArray(allocations) || allocations.length === 0) {
      return res.status(400).json({ message: "Waa in la doortaa ugu yaraan hal invoice oo lacagtu u dhiganto." });
    }
    const allocatedTotal = allocations.reduce((sum, a) => sum + Number(a.amount || 0), 0);
    if (allocatedTotal > amt + 0.0001) {
      return res.status(400).json({ message: "Wadarta lacagta loo qaybiyay waa ka badan tahay lacagta la bixiyay." });
    }

    const payment = await prisma.$transaction(async (tx) => {
      const invoices = await tx.invoice.findMany({ where: { id: { in: allocations.map((a) => a.invoiceId) } } });
      for (const alloc of allocations) {
        const invoice = invoices.find((i) => i.id === alloc.invoiceId);
        if (!invoice) throw Object.assign(new Error("Invoice-kan lama helin."), { statusCode: 404 });
        const allocAmt = Number(alloc.amount);
        if (allocAmt <= 0) throw Object.assign(new Error("Qadarka loo qaybiyay waa inuu ka weyn yahay 0."), { statusCode: 400 });
        if (invoice.amountPaid + allocAmt > invoice.amountDue + 0.0001) {
          throw Object.assign(new Error(`Lacagta loo qaybiyay ${invoice.year}-${invoice.month} way ka badan tahay ku dhiman.`), { statusCode: 400 });
        }
        const newPaid = invoice.amountPaid + allocAmt;
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { amountPaid: newPaid, balance: invoice.amountDue - newPaid, status: billStatus(invoice.amountDue, newPaid) },
        });
      }

      return tx.payment.create({
        data: {
          receiptNumber: generateReceiptNumber(),
          parentId,
          amount: amt,
          method,
          reference,
          notes,
          receivedById: req.user._id,
          allocations: { create: allocations.map((a) => ({ invoiceId: a.invoiceId, amount: Number(a.amount) })) },
        },
        include: { allocations: { include: { invoice: { include: { student: true } } } } },
      });
    });

    logAudit(prisma, { userId: req.user._id, action: "create", module: "payments", recordId: payment.id, newValue: payment });
    res.status(201).json({ payment });
  } catch (err) {
    next(err);
  }
};

// GET /api/payments?parentId=&studentId=
const listPayments = async (req, res, next) => {
  try {
    const { parentId, studentId } = req.query;
    const payments = await prisma.payment.findMany({
      where: {
        ...(parentId ? { parentId } : {}),
        ...(studentId ? { allocations: { some: { invoice: { studentId } } } } : {}),
      },
      include: { parent: true, allocations: { include: { invoice: { include: { student: true } } } } },
      orderBy: { paymentDate: "desc" },
    });
    res.json({ payments: payments.map(withSafeParent) });
  } catch (err) {
    next(err);
  }
};

// GET /api/payments/:id/receipt
const getReceipt = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: {
        parent: true,
        receivedBy: true,
        allocations: { include: { invoice: { include: { student: true } } } },
      },
    });
    if (!payment) return res.status(404).json({ message: "Lacagtan lama helin." });
    const { password, ...safeReceivedBy } = payment.receivedBy || {};
    res.json({ receipt: { ...withSafeParent(payment), receivedBy: payment.receivedBy ? safeReceivedBy : null } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/payments/:id — voids the payment: reverses every allocation
// off its invoice (amountPaid/status recomputed) before removing the
// payment and its allocations, so invoice totals always stay consistent.
const deletePayment = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id }, include: { allocations: true } });
    if (!payment) return res.status(404).json({ message: "Lacagtan lama helin." });

    await prisma.$transaction(async (tx) => {
      for (const alloc of payment.allocations) {
        const invoice = await tx.invoice.findUnique({ where: { id: alloc.invoiceId } });
        if (invoice) {
          const newPaid = Math.max(0, invoice.amountPaid - alloc.amount);
          await tx.invoice.update({
            where: { id: invoice.id },
            data: { amountPaid: newPaid, balance: invoice.amountDue - newPaid, status: billStatus(invoice.amountDue, newPaid) },
          });
        }
      }
      await tx.payment.delete({ where: { id: payment.id } });
    });

    logAudit(prisma, { userId: req.user._id, action: "delete", module: "payments", recordId: payment.id, previousValue: payment });
    res.json({ message: "Lacagta waa la baabi'iyay (voided)." });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPayment, listPayments, getReceipt, deletePayment };
