// Resolves the amount due for one student in one calendar month, applying a
// holiday-driven FeeAdjustment when one exists for that plan/month (falling
// back to a school-wide adjustment, then to the plan's normal monthly price).
const resolveAmount = (mealPlan, adjustment) => {
  if (!adjustment) return mealPlan.monthlyPrice;
  switch (adjustment.adjustmentType) {
    case "none":
      return 0;
    case "half":
      return mealPlan.monthlyPrice / 2;
    case "custom":
      return adjustment.customAmount ?? mealPlan.monthlyPrice;
    case "full":
    default:
      return mealPlan.monthlyPrice;
  }
};

// Creates an Invoice for every active, meal-plan-enrolled student who
// doesn't already have one for that year/month. Existing invoices (which may
// already carry payments) are left untouched — re-running is always safe.
const generateInvoicesForMonth = async (prisma, { year, month, academicYearId }) => {
  const students = await prisma.student.findMany({
    where: { status: "active", mealPlanId: { not: null } },
    include: { mealPlan: true },
  });

  const adjustments = await prisma.feeAdjustment.findMany({ where: { year, month } });
  const adjustmentFor = (mealPlanId) =>
    adjustments.find((a) => a.mealPlanId === mealPlanId) || adjustments.find((a) => a.mealPlanId === null) || null;

  const existing = await prisma.invoice.findMany({
    where: { year, month, studentId: { in: students.map((s) => s.id) } },
    select: { studentId: true },
  });
  const alreadyBilled = new Set(existing.map((i) => i.studentId));
  const toCreate = students.filter((s) => !alreadyBilled.has(s.id));

  const created = await prisma.$transaction(
    toCreate.map((s) => {
      const amount = resolveAmount(s.mealPlan, adjustmentFor(s.mealPlanId));
      return prisma.invoice.create({
        data: {
          studentId: s.id,
          academicYearId,
          year,
          month,
          amountDue: amount,
          balance: amount,
        },
      });
    })
  );

  return { created: created.length, skipped: students.length - toCreate.length, invoices: created };
};

module.exports = { resolveAmount, generateInvoicesForMonth };
