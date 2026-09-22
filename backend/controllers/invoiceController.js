const prisma = require("../lib/prisma");
const { generateInvoicesForMonth } = require("../utils/invoiceEngine");
const { withSafeParent } = require("../utils/serialize");

// POST /api/invoices/generate  { year, month }
const generate = async (req, res, next) => {
  try {
    const year = Number(req.body.year);
    const month = Number(req.body.month);
    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ message: "Sanad iyo bil sax ah waa waajib." });
    }
    const academicYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
    if (!academicYear) return res.status(400).json({ message: "Ma jiro Sanad Dugsiyeed firfircoon. Fadlan marka hore samee mid." });

    const result = await generateInvoicesForMonth(prisma, { year, month, academicYearId: academicYear.id });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/invoices?year=&month=&studentId=&parentId=&status=
const list = async (req, res, next) => {
  try {
    const { year, month, studentId, status, parentId } = req.query;
    const invoices = await prisma.invoice.findMany({
      where: {
        ...(year ? { year: Number(year) } : {}),
        ...(month ? { month: Number(month) } : {}),
        ...(studentId ? { studentId } : {}),
        ...(status ? { status } : {}),
        ...(parentId ? { student: { parentId } } : {}),
      },
      include: { student: { include: { parent: true, class: true } } },
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "asc" }],
    });
    res.json({ invoices: invoices.map((i) => ({ ...i, student: withSafeParent(i.student) })) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/invoices/:id — blocked if any payment has already been
// allocated to it (void the payment first, so amounts stay consistent).
const remove = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    if (!invoice) return res.status(404).json({ message: "Invoice-kan lama helin." });
    if (invoice.amountPaid > 0) {
      return res.status(400).json({ message: "Invoice-kan waxaa lagu bixiyay lacag. Marka hore ka noqo (void) lacagta ka hor intaadan tirtirin." });
    }
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.json({ message: "Invoice-ka waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

module.exports = { generate, list, remove };
