const prisma = require("../lib/prisma");

// GET /api/fee-adjustments?year=&month=
const list = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const where = {
      ...(year ? { year: Number(year) } : {}),
      ...(month ? { month: Number(month) } : {}),
    };
    const adjustments = await prisma.feeAdjustment.findMany({
      where,
      include: { holiday: true, mealPlan: true },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    res.json({ feeAdjustments: adjustments });
  } catch (err) {
    next(err);
  }
};

// POST /api/fee-adjustments  { year, month, adjustmentType, customAmount?, reason?, holidayId?, mealPlanId? }
// mealPlanId omitted/null applies to every plan for that month.
const create = async (req, res, next) => {
  try {
    const { year, month, adjustmentType, customAmount, reason, holidayId, mealPlanId } = req.body;
    if (!year || !month || !adjustmentType) {
      return res.status(400).json({ message: "Sanad, bil, iyo nooca beddelka waa waajib." });
    }
    if (adjustmentType === "custom" && customAmount == null) {
      return res.status(400).json({ message: "Qadarka gaarka ah (custom amount) waa waajib." });
    }
    // Postgres treats NULL as distinct in unique indexes, so a real DB-level
    // upsert can't dedupe the "applies to every plan" (mealPlanId=null) rows
    // via ON CONFLICT. Do the find-then-write manually instead.
    const scope = mealPlanId || null;
    const yearNum = Number(year);
    const monthNum = Number(month);
    const existing = await prisma.feeAdjustment.findFirst({ where: { year: yearNum, month: monthNum, mealPlanId: scope } });
    const data = {
      adjustmentType,
      customAmount: customAmount != null ? Number(customAmount) : null,
      reason,
      holidayId: holidayId || null,
    };
    const adjustment = existing
      ? await prisma.feeAdjustment.update({ where: { id: existing.id }, data })
      : await prisma.feeAdjustment.create({ data: { ...data, year: yearNum, month: monthNum, mealPlanId: scope } });
    res.status(201).json({ feeAdjustment: adjustment });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/fee-adjustments/:id
const remove = async (req, res, next) => {
  try {
    await prisma.feeAdjustment.delete({ where: { id: req.params.id } });
    res.json({ message: "Beddelka lacagta waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, remove };
