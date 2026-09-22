const prisma = require("../lib/prisma");

// GET /api/search?q=  — global search across students, parents, classes (§23)
const search = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ students: [], parents: [], classes: [] });

    const [students, parents, classes] = await Promise.all([
      prisma.student.findMany({
        where: { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { studentCode: { contains: q, mode: "insensitive" } }] },
        include: { class: true },
        take: 10,
      }),
      prisma.parent.findMany({
        where: { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] },
        take: 10,
      }),
      prisma.class.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 10 }),
    ]);

    res.json({
      students: students.map((s) => ({ id: s.id, label: `${s.fullName} (${s.studentCode})`, className: s.class?.name })),
      parents: parents.map((p) => ({ id: p.id, label: `${p.fullName} (${p.phone})` })),
      classes: classes.map((c) => ({ id: c.id, label: c.name })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { search };
