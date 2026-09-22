const prisma = require("../lib/prisma");

const getSettings = async (req, res, next) => {
  try {
    const settings = await prisma.systemSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });
    res.json({ settings });
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings  { schoolName?, currency?, occasionalMealPrice? }
const updateSettings = async (req, res, next) => {
  try {
    const { schoolName, currency, occasionalMealPrice } = req.body;
    const settings = await prisma.systemSettings.upsert({
      where: { id: "default" },
      update: {
        schoolName,
        currency,
        occasionalMealPrice: occasionalMealPrice !== undefined ? Number(occasionalMealPrice) : undefined,
      },
      create: {
        id: "default",
        schoolName: schoolName || undefined,
        currency: currency || undefined,
        occasionalMealPrice: occasionalMealPrice != null ? Number(occasionalMealPrice) : undefined,
      },
    });
    res.json({ settings });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };
