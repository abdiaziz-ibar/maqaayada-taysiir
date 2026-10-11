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

// A student who enrolls partway through a billing month shouldn't be
// charged for days before they joined. Returns the prorated amount, the
// full amount if they were already enrolled by the 1st, or null if they
// hadn't enrolled yet at all during that month (no invoice should exist).
const proratedAmount = (amount, enrollmentDate, year, month) => {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month - 1, daysInMonth));
  const enrolled = new Date(Date.UTC(enrollmentDate.getUTCFullYear(), enrollmentDate.getUTCMonth(), enrollmentDate.getUTCDate()));

  if (enrolled <= monthStart) return amount;
  if (enrolled > monthEnd) return null;

  const daysRemaining = daysInMonth - enrolled.getUTCDate() + 1;
  return Math.round(amount * (daysRemaining / daysInMonth) * 100) / 100;
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
    toCreate
      .map((s) => {
        const fullAmount = resolveAmount(s.mealPlan, adjustmentFor(s.mealPlanId));
        const amount = proratedAmount(fullAmount, s.enrollmentDate, year, month);
        if (amount === null) return null; // not yet enrolled during this month
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
      .filter(Boolean)
  );

  return { created: created.length, skipped: students.length - created.length, invoices: created };
};

module.exports = { resolveAmount, proratedAmount, generateInvoicesForMonth };
