const prisma = require("../lib/prisma");
const { serializeParent } = require("../utils/serialize");

// GET /api/reports/outstanding-balances?status=all|overdue|partial|unpaid
// Every parent with any unpaid/partial invoice balance (spec §18).
const outstandingBalances = async (req, res, next) => {
  try {
    const { status } = req.query;
    const parents = await prisma.parent.findMany({
      include: { students: { include: { invoices: true } } },
    });

    const rows = parents
      .map((p) => {
        const invoices = p.students.flatMap((s) => s.invoices);
        const unpaid = invoices.filter((i) => i.status !== "paid");
        const totalDue = invoices.reduce((sum, i) => sum + i.amountDue, 0);
        const totalPaid = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
        const outstanding = totalDue - totalPaid;
        const oldest = unpaid.sort((a, b) => a.year - b.year || a.month - b.month)[0];
        return {
          parent: serializeParent(p),
          childrenCount: p.students.length,
          totalDue,
          totalPaid,
          outstanding,
          oldestUnpaidMonth: oldest ? `${oldest.year}-${String(oldest.month).padStart(2, "0")}` : null,
          hasPartial: unpaid.some((i) => i.status === "partial"),
          hasUnpaid: unpaid.some((i) => i.status === "unpaid"),
        };
      })
      .filter((r) => r.outstanding > 0.0001);

    const filtered = rows.filter((r) => {
      if (!status || status === "all") return true;
      if (status === "partial") return r.hasPartial;
      if (status === "unpaid") return r.hasUnpaid;
      if (status === "overdue") return r.outstanding > 0; // simple definition: any outstanding balance
      return true;
    });

    res.json({ rows: filtered });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/monthly-payments?year=&month=  (spec §14)
const monthlyPaymentReport = async (req, res, next) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    if (!year || !month) return res.status(400).json({ message: "Sanad iyo bil waa waajib." });

    const invoices = await prisma.invoice.findMany({
      where: { year, month },
      include: { student: { include: { parent: true } } },
    });

    const byParent = new Map();
    for (const inv of invoices) {
      const parent = inv.student.parent;
      const row = byParent.get(parent.id) || { parent: serializeParent(parent), students: 0, totalDue: 0, paid: 0, balance: 0 };
      row.students += 1;
      row.totalDue += inv.amountDue;
      row.paid += inv.amountPaid;
      row.balance += inv.amountDue - inv.amountPaid;
      byParent.set(parent.id, row);
    }
    const rows = Array.from(byParent.values()).map((r) => ({
      ...r,
      status: r.balance <= 0.0001 ? "paid" : r.paid > 0 ? "partial" : "unpaid",
    }));

    res.json({ year, month, rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/annual?academicYearId=  (spec §15)
const annualReport = async (req, res, next) => {
  try {
    const academicYear = req.query.academicYearId
      ? await prisma.academicYear.findUnique({ where: { id: req.query.academicYearId } })
      : await prisma.academicYear.findFirst({ where: { isActive: true } });
    if (!academicYear) return res.status(400).json({ message: "Sanad Dugsiyeed lama helin." });

    const invoices = await prisma.invoice.findMany({ where: { academicYearId: academicYear.id } });
    const byMonth = new Map();
    for (const inv of invoices) {
      const key = `${inv.year}-${String(inv.month).padStart(2, "0")}`;
      const row = byMonth.get(key) || { year: inv.year, month: inv.month, totalDue: 0, totalPaid: 0 };
      row.totalDue += inv.amountDue;
      row.totalPaid += inv.amountPaid;
      byMonth.set(key, row);
    }
    const months = Array.from(byMonth.values())
      .sort((a, b) => a.year - b.year || a.month - b.month)
      .map((m) => ({ ...m, outstanding: m.totalDue - m.totalPaid }));

    const totals = months.reduce(
      (acc, m) => ({ totalDue: acc.totalDue + m.totalDue, totalPaid: acc.totalPaid + m.totalPaid, outstanding: acc.outstanding + m.outstanding }),
      { totalDue: 0, totalPaid: 0, outstanding: 0 }
    );

    res.json({ academicYear, months, totals });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/student-meal-history/:studentId  (spec §19)
const studentMealHistory = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.studentId }, include: { class: true } });
    if (!student) return res.status(404).json({ message: "Ardaygan lama helin." });

    const attendances = await prisma.mealAttendance.findMany({
      where: { studentId: student.id },
      orderBy: { date: "desc" },
    });
    const expected = attendances.length;
    const ate = attendances.filter((a) => a.status === "ate").length;
    const missed = attendances.filter((a) => a.status === "did_not_eat").length;
    const attendancePct = expected > 0 ? Math.round((ate / expected) * 100) : 0;

    res.json({
      student,
      attendances,
      summary: { totalExpected: expected, totalEaten: ate, totalMissed: missed, attendancePercentage: attendancePct },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/profit-loss?year=&month=
// "Xisaab-xir": money in (meal-fee payments + paid occasional meals) vs
// money out (operating expenses) for one calendar month, so a loss shows
// up immediately rather than being buried in separate pages.
const profitAndLoss = async (req, res, next) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    if (!year || !month) return res.status(400).json({ message: "Sanad iyo bil waa waajib." });

    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const [payments, occasionalMeals, expenses] = await Promise.all([
      prisma.payment.findMany({ where: { paymentDate: { gte: start, lt: end } } }),
      prisma.occasionalMeal.findMany({ where: { date: { gte: start, lt: end }, paymentStatus: "paid" } }),
      prisma.expense.findMany({ where: { date: { gte: start, lt: end } } }),
    ]);

    const mealFeeIncome = payments.reduce((sum, p) => sum + p.amount, 0);
    const occasionalIncome = occasionalMeals.reduce((sum, m) => sum + (m.amountCharged || 0), 0);
    const totalIncome = mealFeeIncome + occasionalIncome;

    const expensesByCategory = {};
    for (const e of expenses) {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    }
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      year,
      month,
      income: { mealFeePayments: mealFeeIncome, occasionalMeals: occasionalIncome, total: totalIncome },
      expenses: { total: totalExpenses, byCategory: expensesByCategory, items: expenses },
      net: totalIncome - totalExpenses,
      isLoss: totalIncome - totalExpenses < 0,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { outstandingBalances, monthlyPaymentReport, annualReport, studentMealHistory, profitAndLoss };
