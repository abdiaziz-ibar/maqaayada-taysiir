require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

const DEFAULT_CLASSES = ["Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];

const run = async () => {
  const existingAdmin = await prisma.user.findUnique({ where: { username: "admin" } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash("Admin@123", 10);
    await prisma.user.create({
      data: { fullName: "Canteen Administrator", username: "admin", password: hashed, role: "admin", status: "active" },
    });
    console.log("Admin user waa la abuuray -> username: admin | password: Admin@123");
  } else {
    console.log("Admin user horey buu u jiray.");
  }

  await prisma.systemSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", schoolName: "Taysiir International Schools", currency: "$", occasionalMealPrice: 1 },
  });
  console.log("SystemSettings waa hubsaday.");

  for (let i = 0; i < DEFAULT_CLASSES.length; i++) {
    await prisma.class.upsert({
      where: { name: DEFAULT_CLASSES[i] },
      update: {},
      create: { name: DEFAULT_CLASSES[i], order: i },
    });
  }
  console.log("Fasallada default-ka ah waa la abuuray (Kindergarten - Grade 6).");

  const yearName = "2026-2027";
  const existingYear = await prisma.academicYear.findUnique({ where: { name: yearName } });
  if (!existingYear) {
    await prisma.academicYear.create({
      data: {
        name: yearName,
        startDate: new Date("2026-09-01T00:00:00.000Z"),
        endDate: new Date("2027-08-31T00:00:00.000Z"),
        isActive: true,
      },
    });
    console.log(`Sanad Dugsiyeedka ${yearName} waa la abuuray oo waa firfircoon.`);
  } else {
    console.log(`Sanad Dugsiyeedka ${yearName} horey buu u jiray.`);
  }

  const existingPlans = await prisma.mealPlan.count();
  if (existingPlans === 0) {
    await prisma.mealPlan.createMany({
      data: [
        { name: "KG Full Board", mealTypes: ["breakfast", "lunch"], monthlyPrice: 30 },
        { name: "Grade Full", mealTypes: ["lunch"], monthlyPrice: 25 },
      ],
    });
    console.log("Meal plans default-ka ah waa la abuuray.");
  } else {
    console.log("Meal plans horey bay u jireen.");
  }
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
