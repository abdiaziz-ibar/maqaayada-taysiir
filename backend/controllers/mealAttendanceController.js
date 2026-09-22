const prisma = require("../lib/prisma");
const { normalizeDate } = require("../utils/date");

// Strips the parent's password hash out of a record.student.parent include.
const stripStudentParentPassword = (record) => {
  if (!record.student?.parent) return record;
  const { password, ...safeParent } = record.student.parent;
  return { ...record, student: { ...record.student, parent: safeParent } };
};

// GET /api/attendance?date=&mealType=&classId=&sectionId=
// Roster of every active, meal-plan student expected for that meal, with
// today's recorded status attached (or "expected" if not yet marked).
const getRoster = async (req, res, next) => {
  try {
    const { mealType, classId, sectionId } = req.query;
    if (!mealType) return res.status(400).json({ message: "Nooca cuntada (mealType) waa waajib." });
    const date = normalizeDate(req.query.date);

    const students = await prisma.student.findMany({
      where: {
        status: "active",
        mealPlan: { mealTypes: { has: mealType } },
        ...(classId ? { classId } : {}),
        ...(sectionId ? { sectionId } : {}),
      },
      include: {
        class: true,
        section: true,
        mealAttendances: { where: { date, mealType } },
      },
      orderBy: { fullName: "asc" },
    });

    res.json({
      date,
      mealType,
      roster: students.map((s) => {
        const record = s.mealAttendances[0] || null;
        return {
          studentId: s.id,
          studentCode: s.studentCode,
          fullName: s.fullName,
          className: s.class?.name || null,
          sectionName: s.section?.name || null,
          status: record?.status || "expected",
          recordId: record?.id || null,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/attendance/:studentId  { date, mealType, ate: true|false }
const recordAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { mealType, ate } = req.body;
    if (!mealType || typeof ate !== "boolean") {
      return res.status(400).json({ message: "Nooca cuntada iyo xaaladda cunidda waa waajib." });
    }
    const date = normalizeDate(req.body.date);

    const record = await prisma.mealAttendance.upsert({
      where: { studentId_date_mealType: { studentId, date, mealType } },
      update: { ate, status: ate ? "ate" : "did_not_eat", recordedById: req.user._id, recordedAt: new Date() },
      create: {
        studentId,
        date,
        mealType,
        ate,
        status: ate ? "ate" : "did_not_eat",
        expected: true,
        recordedById: req.user._id,
        recordedAt: new Date(),
      },
    });
    res.json({ record });
  } catch (err) {
    next(err);
  }
};

// Shared filter builder for the "who ate" / "who did not eat" views (§9).
const buildFilters = (query) => {
  const { date, mealType, classId, sectionId, studentId, parentId } = query;
  return {
    ...(date ? { date: normalizeDate(date) } : {}),
    ...(mealType ? { mealType } : {}),
    ...(studentId ? { studentId } : {}),
    student: {
      ...(classId ? { classId } : {}),
      ...(sectionId ? { sectionId } : {}),
      ...(parentId ? { parentId } : {}),
    },
  };
};

// GET /api/attendance/who-ate
const whoAte = async (req, res, next) => {
  try {
    const records = await prisma.mealAttendance.findMany({
      where: { ...buildFilters(req.query), status: "ate" },
      include: { student: { include: { class: true, parent: true } } },
      orderBy: { date: "desc" },
    });
    res.json({ records: records.map(stripStudentParentPassword) });
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/who-did-not-eat
const whoDidNotEat = async (req, res, next) => {
  try {
    const records = await prisma.mealAttendance.findMany({
      where: { ...buildFilters(req.query), status: "did_not_eat" },
      include: { student: { include: { class: true, parent: true } } },
      orderBy: { date: "desc" },
    });
    res.json({ records: records.map(stripStudentParentPassword) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/attendance/:id — removes a recorded entry, resetting that
// student back to "expected" (un-marked) for that day/meal.
const deleteAttendance = async (req, res, next) => {
  try {
    await prisma.mealAttendance.delete({ where: { id: req.params.id } });
    res.json({ message: "Diiwaanka waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRoster, recordAttendance, whoAte, whoDidNotEat, deleteAttendance };
