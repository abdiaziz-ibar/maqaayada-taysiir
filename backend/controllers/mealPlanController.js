const prisma = require("../lib/prisma");

// GET /api/meal-plans
const list = async (req, res, next) => {
  try {
    const mealPlans = await prisma.mealPlan.findMany({ orderBy: { createdAt: "asc" } });
    res.json({ mealPlans });
  } catch (err) {
    next(err);
  }
};

// POST /api/meal-plans  { name, mealTypes: [], monthlyPrice, startDate?, endDate? }
const create = async (req, res, next) => {
  try {
    const { name, mealTypes, monthlyPrice, startDate, endDate } = req.body;
    if (!name || !Array.isArray(mealTypes) || mealTypes.length === 0 || monthlyPrice == null) {
      return res.status(400).json({ message: "Magaca, noocyada cuntada, iyo qiimaha bishii waa waajib." });
    }
    const mealPlan = await prisma.mealPlan.create({
      data: {
        name,
        mealTypes,
        monthlyPrice: Number(monthlyPrice),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
    res.status(201).json({ mealPlan });
  } catch (err) {
    next(err);
  }
};

// PUT /api/meal-plans/:id
const update = async (req, res, next) => {
  try {
    const { name, mealTypes, monthlyPrice, startDate, endDate, isActive } = req.body;
    const mealPlan = await prisma.mealPlan.update({
      where: { id: req.params.id },
      data: {
        name,
        mealTypes,
        monthlyPrice: monthlyPrice != null ? Number(monthlyPrice) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
      },
    });
    res.json({ mealPlan });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/meal-plans/:id — students on this plan have mealPlanId set to null (SetNull).
const remove = async (req, res, next) => {
  try {
    await prisma.mealPlan.delete({ where: { id: req.params.id } });
    res.json({ message: "Meal Plan-ka waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update, remove };
