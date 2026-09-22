const prisma = require("../lib/prisma");
const { normalizeDate } = require("../utils/date");

// GET /api/dashboard — the §13 summary cards in one call.
const getDashboard = async (req, res, next) => {
  try {
    const today = normalizeDate();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const [totalStudents, activeStudents, mealPlanStudents, occasionalCount, todayAttendance, monthInvoices, unpaidParentsRaw, todayMenus] =
      await Promise.all([
        prisma.student.count(),
        prisma.student.count({ where: { status: "active" } }),
        prisma.student.count({ where: { status: "active", mealPlanId: { not: null } } }),
        prisma.occasionalMeal.count({ where: { date: { gte: new Date(today.getTime() - 30 * 86400000) } } }),
        prisma.mealAttendance.findMany({ where: { date: today } }),
        prisma.invoice.findMany({ where: { year, month } }),
        prisma.invoice.findMany({ where: { status: { in: ["unpaid", "partial"] } }, select: { student: { select: { parentId: true } } } }),
        prisma.menu.findMany({ where: { date: today }, include: { items: { include: { food: true } } } }),
      ]);

    const expectedToday = todayAttendance.length;
    const ateToday = todayAttendance.filter((a) => a.status === "ate").length;
    const didNotEatToday = todayAttendance.filter((a) => a.status === "did_not_eat").length;

    const todaysPayments = await prisma.payment.findMany({
      where: { paymentDate: { gte: today, lt: new Date(today.getTime() + 86400000) } },
    });
    const monthPayments = await prisma.payment.findMany({ where: { paymentDate: { gte: new Date(year, month - 1, 1) } } });

    res.json({
      students: {
        total: totalStudents,
        active: activeStudents,
        mealPlanEnrolled: mealPlanStudents,
        occasionalLast30Days: occasionalCount,
      },
      todayMeals: {
        expected: expectedToday,
        ate: ateToday,
        didNotEat: didNotEatToday,
        attendancePercentage: expectedToday > 0 ? Math.round((ateToday / expectedToday) * 100) : 0,
      },
      financial: {
        todaysPayments: todaysPayments.reduce((s, p) => s + p.amount, 0),
        monthPayments: monthPayments.reduce((s, p) => s + p.amount, 0),
        monthRevenueExpected: monthInvoices.reduce((s, i) => s + i.amountDue, 0),
        outstanding: monthInvoices.reduce((s, i) => s + (i.amountDue - i.amountPaid), 0),
        unpaidParents: new Set(unpaidParentsRaw.map((i) => i.student.parentId)).size,
      },
      restaurant: {
        todayMenus: todayMenus.map((m) => ({ mealType: m.mealType, foods: m.items.map((it) => it.food.name) })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
