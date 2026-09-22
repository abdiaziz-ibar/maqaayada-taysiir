const prisma = require("../lib/prisma");
const { nextCode } = require("../utils/codeGenerator");
const { serializeParent } = require("../utils/serialize");

// GET /api/parents?search=
const listParents = async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = search
      ? { OR: [{ fullName: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }] }
      : {};
    const parents = await prisma.parent.findMany({
      where,
      include: { students: { include: { class: true, mealPlan: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ parents: parents.map((p) => ({ ...serializeParent(p), students: p.students })) });
  } catch (err) {
    next(err);
  }
};

// GET /api/parents/:id — full profile: children, financial summary, payment history (spec §3/§20)
const getParent = async (req, res, next) => {
  try {
    const parent = await prisma.parent.findUnique({
      where: { id: req.params.id },
      include: {
        students: { include: { class: true, mealPlan: true, invoices: true } },
        payments: {
          include: { allocations: { include: { invoice: { include: { student: true } } } } },
          orderBy: { paymentDate: "desc" },
        },
      },
    });
    if (!parent) return res.status(404).json({ message: "Waalidka lama helin." });

    const totalMonthlyFees = parent.students
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + (s.mealPlan?.monthlyPrice || 0), 0);
    const allInvoices = parent.students.flatMap((s) => s.invoices);
    const totalPaid = allInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalOutstanding = allInvoices.reduce((sum, inv) => sum + (inv.amountDue - inv.amountPaid), 0);

    res.json({
      parent: serializeParent(parent),
      students: parent.students,
      payments: parent.payments,
      financialSummary: { totalMonthlyFees, totalPaid, totalOutstanding },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/parents  { fullName, phone, alternativePhone?, address?, email?, notes? }
const createParent = async (req, res, next) => {
  try {
    const { fullName, phone, alternativePhone, address, email, notes } = req.body;
    if (!fullName || !phone) {
      return res.status(400).json({ message: "Magaca iyo Telefoonka waalidka waa waajib." });
    }
    const parentCode = await nextCode(prisma, "parent", "parentCode", "P");
    const parent = await prisma.parent.create({
      data: { fullName, phone, alternativePhone, address, email, notes, parentCode },
    });
    res.status(201).json({ parent: serializeParent(parent) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/parents/:id
const updateParent = async (req, res, next) => {
  try {
    const { fullName, phone, alternativePhone, address, email, notes, status } = req.body;
    const parent = await prisma.parent.update({
      where: { id: req.params.id },
      data: { fullName, phone, alternativePhone, address, email, notes, status },
    });
    res.json({ parent: serializeParent(parent) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/parents/:id — cascades to every linked student and all of
// that student's invoices/attendance/occasional meals/payments.
const deleteParent = async (req, res, next) => {
  try {
    await prisma.parent.delete({ where: { id: req.params.id } });
    res.json({ message: "Waalidka waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

module.exports = { listParents, getParent, createParent, updateParent, deleteParent };
