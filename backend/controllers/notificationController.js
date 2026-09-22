const prisma = require("../lib/prisma");

// GET /api/notifications — computed on read, not stored: unpaid/overdue/
// partial invoices plus any holiday starting within the next 14 days.
// Simplest correct approach for v1; a future SMS/WhatsApp integration can
// hang off the same underlying queries.
const list = async (req, res, next) => {
  try {
    const now = new Date();
    const in14Days = new Date(now.getTime() + 14 * 86400000);

    const [unpaidCount, partialCount, upcomingHolidays] = await Promise.all([
      prisma.invoice.count({ where: { status: "unpaid" } }),
      prisma.invoice.count({ where: { status: "partial" } }),
      prisma.holiday.findMany({ where: { startDate: { gte: now, lte: in14Days } } }),
    ]);

    const notifications = [];
    if (unpaidCount > 0) {
      notifications.push({ type: "unpaid_fees", message: `${unpaidCount} invoice oo aan la bixin ayaa jira.`, count: unpaidCount });
    }
    if (partialCount > 0) {
      notifications.push({ type: "partial_payment", message: `${partialCount} invoice oo qayb ahaan loo bixiyay ayaa jira.`, count: partialCount });
    }
    for (const h of upcomingHolidays) {
      notifications.push({ type: "holiday", message: `Fasax "${h.name}" ayaa bilaabanaya ${h.startDate.toISOString().slice(0, 10)}.`, relatedId: h.id });
    }

    res.json({ notifications });
  } catch (err) {
    next(err);
  }
};

module.exports = { list };
