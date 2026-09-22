const prisma = require("../lib/prisma");
const { normalizeDate } = require("../utils/date");

// GET /api/menus?startDate=&endDate=
const list = async (req, res, next) => {
  try {
    const start = normalizeDate(req.query.startDate);
    const end = normalizeDate(req.query.endDate || req.query.startDate);
    const menus = await prisma.menu.findMany({
      where: { date: { gte: start, lte: end } },
      include: { items: { include: { food: true } } },
      orderBy: [{ date: "asc" }, { mealType: "asc" }],
    });
    res.json({ menus });
  } catch (err) {
    next(err);
  }
};

// PUT /api/menus  { date, mealType, foodIds: [] }
// Replaces the food list for that date+mealType (create-if-missing).
const setMenu = async (req, res, next) => {
  try {
    const { mealType, foodIds } = req.body;
    if (!mealType || !Array.isArray(foodIds)) {
      return res.status(400).json({ message: "Nooca cuntada iyo liiska cuntooyinka waa waajib." });
    }
    const date = normalizeDate(req.body.date);

    const menu = await prisma.$transaction(async (tx) => {
      const existing = await tx.menu.upsert({
        where: { date_mealType: { date, mealType } },
        update: {},
        create: { date, mealType },
      });
      await tx.menuItem.deleteMany({ where: { menuId: existing.id } });
      if (foodIds.length > 0) {
        await tx.menuItem.createMany({ data: foodIds.map((foodId) => ({ menuId: existing.id, foodId })) });
      }
      return tx.menu.findUnique({ where: { id: existing.id }, include: { items: { include: { food: true } } } });
    });

    res.json({ menu });
  } catch (err) {
    next(err);
  }
};

// POST /api/menus/copy  { fromDate, toDate }
// Copies every meal type's menu from one day onto another (overwrites toDate).
const copyDay = async (req, res, next) => {
  try {
    const fromDate = normalizeDate(req.body.fromDate);
    const toDate = normalizeDate(req.body.toDate);
    const sourceMenus = await prisma.menu.findMany({ where: { date: fromDate }, include: { items: true } });

    const copied = await prisma.$transaction(
      sourceMenus.map((source) =>
        prisma.menu.upsert({
          where: { date_mealType: { date: toDate, mealType: source.mealType } },
          update: {},
          create: { date: toDate, mealType: source.mealType },
        })
      )
    );

    for (let i = 0; i < sourceMenus.length; i++) {
      await prisma.menuItem.deleteMany({ where: { menuId: copied[i].id } });
      if (sourceMenus[i].items.length > 0) {
        await prisma.menuItem.createMany({
          data: sourceMenus[i].items.map((it) => ({ menuId: copied[i].id, foodId: it.foodId })),
        });
      }
    }

    res.json({ copied: sourceMenus.length });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/menus?date=&mealType=  — clears the menu for that date+mealType.
const clearMenu = async (req, res, next) => {
  try {
    const { mealType } = req.query;
    if (!mealType) return res.status(400).json({ message: "Nooca cuntada waa waajib." });
    const date = normalizeDate(req.query.date);
    const menu = await prisma.menu.findUnique({ where: { date_mealType: { date, mealType } } });
    if (menu) await prisma.menu.delete({ where: { id: menu.id } });
    res.json({ message: "Menu-ga waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, setMenu, copyDay, clearMenu };
