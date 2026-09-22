const prisma = require("../lib/prisma");

// POST /api/occasional-meals  { studentId, mealType, date? }
// Records a one-off meal for a student who is searched up by ID/name but is
// NOT on an active meal plan for this meal type. Never touches the
// student's mealPlanId (business rule: occasional meals never auto-convert
// a student into a recurring subscriber).
const create = async (req, res, next) => {
  try {
    const { studentId, mealType } = req.body;
    if (!studentId || !mealType) return res.status(400).json({ message: "Ardayga iyo nooca cuntada waa waajib." });

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return res.status(404).json({ message: "Ardaygan lama helin." });

    const date = req.body.date ? new Date(`${String(req.body.date).slice(0, 10)}T00:00:00.000Z`) : new Date();
    const settings = await prisma.systemSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });

    const meal = await prisma.occasionalMeal.create({
      data: {
        studentId,
        date,
        mealType,
        recordedById: req.user._id,
        amountCharged: settings.occasionalMealPrice,
      },
      include: { student: { include: { class: true, parent: true } } },
    });
    const { password, ...safeParent } = meal.student.parent;
    res.status(201).json({ meal: { ...meal, student: { ...meal.student, parent: safeParent } } });
  } catch (err) {
    next(err);
  }
};

// GET /api/occasional-meals?search=&paymentStatus=
const list = async (req, res, next) => {
  try {
    const { search, paymentStatus } = req.query;
    const meals = await prisma.occasionalMeal.findMany({
      where: {
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(search ? { student: { fullName: { contains: search, mode: "insensitive" } } } : {}),
      },
      include: { student: { include: { class: true } } },
      orderBy: { date: "desc" },
    });
    res.json({ meals });
  } catch (err) {
    next(err);
  }
};

// POST /api/occasional-meals/:id/pay — marks it paid (matches the parent's cash-on-the-spot payment)
const markPaid = async (req, res, next) => {
  try {
    const meal = await prisma.occasionalMeal.update({ where: { id: req.params.id }, data: { paymentStatus: "paid" } });
    res.json({ meal });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/occasional-meals/:id
const remove = async (req, res, next) => {
  try {
    await prisma.occasionalMeal.delete({ where: { id: req.params.id } });
    res.json({ message: "Diiwaanka waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, markPaid, remove };
