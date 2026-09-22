const prisma = require("../lib/prisma");

// GET /api/audit-logs?module=&userId=
const list = async (req, res, next) => {
  try {
    const { module, userId } = req.query;
    const logs = await prisma.auditLog.findMany({
      where: {
        ...(module ? { module } : {}),
        ...(userId ? { userId } : {}),
      },
      include: { user: { select: { id: true, fullName: true, username: true } } },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
};

module.exports = { list };
