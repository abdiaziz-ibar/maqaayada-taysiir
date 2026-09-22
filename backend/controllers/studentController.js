const prisma = require("../lib/prisma");
const { nextCode } = require("../utils/codeGenerator");
const { serializeStudent, withSafeParent } = require("../utils/serialize");

const includeRelations = { parent: true, class: true, section: true, mealPlan: true };

// GET /api/students?search=&status=&classId=
const listStudents = async (req, res, next) => {
  try {
    const { search, status, classId } = req.query;
    const where = {
      ...(status ? { status } : {}),
      ...(classId ? { classId } : {}),
      ...(search
        ? { OR: [{ fullName: { contains: search, mode: "insensitive" } }, { studentCode: { contains: search, mode: "insensitive" } }] }
        : {}),
    };
    const students = await prisma.student.findMany({ where, include: includeRelations, orderBy: { createdAt: "desc" } });
    res.json({ students: students.map((s) => withSafeParent(serializeStudent(s))) });
  } catch (err) {
    next(err);
  }
};

// GET /api/students/search?q=  — lightweight lookup for the occasional-meal search box
const searchStudents = async (req, res, next) => {
  try {
    const q = req.query.q || "";
    const students = await prisma.student.findMany({
      where: {
        status: "active",
        OR: [{ fullName: { contains: q, mode: "insensitive" } }, { studentCode: { contains: q, mode: "insensitive" } }],
      },
      include: { class: true, mealPlan: true },
      take: 15,
      orderBy: { fullName: "asc" },
    });
    res.json({ students: students.map(serializeStudent) });
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:id
const getStudent = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: { ...includeRelations, invoices: { orderBy: [{ year: "desc" }, { month: "desc" }] } },
    });
    if (!student) return res.status(404).json({ message: "Ardaygan lama helin." });
    res.json({ student: withSafeParent(serializeStudent(student)) });
  } catch (err) {
    next(err);
  }
};

// POST /api/students  { fullName, gender?, dateOfBirth?, classId?, sectionId?, mealPlanId?, parentId?, newParent?, notes? }
const createStudent = async (req, res, next) => {
  try {
    const { fullName, gender, dateOfBirth, classId, sectionId, mealPlanId, parentId, newParent, notes } = req.body;
    if (!fullName) return res.status(400).json({ message: "Magaca ardayga waa waajib." });
    if (!parentId && !newParent) {
      return res.status(400).json({ message: "Waa in la doortaa waalid jira ama la geliyaa waalid cusub." });
    }

    let resolvedParentId = parentId;
    if (!resolvedParentId) {
      if (!newParent.fullName || !newParent.phone) {
        return res.status(400).json({ message: "Magaca iyo Telefoonka waalidka cusub waa waajib." });
      }
      const parentCode = await nextCode(prisma, "parent", "parentCode", "P");
      const parent = await prisma.parent.create({
        data: { fullName: newParent.fullName, phone: newParent.phone, address: newParent.address, parentCode },
      });
      resolvedParentId = parent.id;
    }

    const studentCode = await nextCode(prisma, "student", "studentCode", "S");
    const student = await prisma.student.create({
      data: {
        fullName,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        mealPlanId: mealPlanId || undefined,
        parentId: resolvedParentId,
        studentCode,
        notes,
      },
      include: includeRelations,
    });
    res.status(201).json({ student: withSafeParent(serializeStudent(student)) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/:id
const updateStudent = async (req, res, next) => {
  try {
    const { fullName, gender, dateOfBirth, classId, sectionId, mealPlanId, status, parentId, notes } = req.body;
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: {
        fullName,
        gender,
        status,
        parentId,
        notes,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        classId: classId !== undefined ? classId || null : undefined,
        sectionId: sectionId !== undefined ? sectionId || null : undefined,
        mealPlanId: mealPlanId !== undefined ? mealPlanId || null : undefined,
      },
      include: includeRelations,
    });
    res.json({ student: withSafeParent(serializeStudent(student)) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/students/:id — cascades to that student's invoices, attendance,
// and occasional meals (see schema onDelete: Cascade).
const deleteStudent = async (req, res, next) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } });
    res.json({ message: "Ardayga waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

module.exports = { listStudents, searchStudents, getStudent, createStudent, updateStudent, deleteStudent };
