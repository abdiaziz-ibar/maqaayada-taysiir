const prisma = require("../lib/prisma");
const { logAudit } = require("../utils/auditLog");

// GET /api/expenses?year=&month=&category=
const list = async (req, res, next) => {
  try {
    const { year, month, category } = req.query;
    const where = { ...(category ? { category } : {}) };
    if (year) {
      const y = Number(year);
      const m = month ? Number(month) : null;
      const start = m ? new Date(Date.UTC(y, m - 1, 1)) : new Date(Date.UTC(y, 0, 1));
      const end = m ? new Date(Date.UTC(y, m, 1)) : new Date(Date.UTC(y + 1, 0, 1));
      where.date = { gte: start, lt: end };
    }
    const expenses = await prisma.expense.findMany({
      where,
      include: { recordedBy: { select: { id: true, fullName: true } } },
      orderBy: { date: "desc" },
    });
    res.json({ expenses });
  } catch (err) {
    next(err);
  }
};

// POST /api/expenses  { category, description, amount, date?, paymentMethod?, notes? }
const create = async (req, res, next) => {
  try {
    const { category, description, amount, date, paymentMethod, notes } = req.body;
    if (!category || !description || !amount) {
      return res.status(400).json({ message: "Qaybta, sharaxaada, iyo qadarka lacagta waa waajib." });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ message: "Qadarka lacagta waa inuu ka weyn yahay 0." });
    }
    const expense = await prisma.expense.create({
      data: {
        category,
        description,
        amount: Number(amount),
        date: date ? new Date(date) : undefined,
        paymentMethod,
        notes,
        recordedById: req.user._id,
      },
    });
    logAudit(prisma, { userId: req.user._id, action: "create", module: "expenses", recordId: expense.id, newValue: expense });
    res.status(201).json({ expense });
  } catch (err) {
    next(err);
  }
};

// PUT /api/expenses/:id
const update = async (req, res, next) => {
  try {
    const before = await prisma.expense.findUnique({ where: { id: req.params.id } });
    if (!before) return res.status(404).json({ message: "Kharashkan lama helin." });

    const { category, description, amount, date, paymentMethod, notes } = req.body;
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        category,
        description,
        amount: amount != null ? Number(amount) : undefined,
        date: date ? new Date(date) : undefined,
        paymentMethod,
        notes,
      },
    });
    logAudit(prisma, {
      userId: req.user._id,
      action: "update",
      module: "expenses",
      recordId: expense.id,
      previousValue: before,
      newValue: expense,
    });
    res.json({ expense });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/expenses/:id
const remove = async (req, res, next) => {
  try {
    const expense = await prisma.expense.delete({ where: { id: req.params.id } });
    logAudit(prisma, { userId: req.user._id, action: "delete", module: "expenses", recordId: expense.id, previousValue: expense });
    res.json({ message: "Kharashka waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update, remove };
