const prisma = require("../lib/prisma");

// GET /api/foods?search=&activeOnly=
const list = async (req, res, next) => {
  try {
    const { search, activeOnly } = req.query;
    const where = {
      ...(activeOnly === "true" ? { isActive: true } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    };
    const foods = await prisma.food.findMany({ where, orderBy: { name: "asc" } });
    res.json({ foods });
  } catch (err) {
    next(err);
  }
};

// POST /api/foods  { name, category?, description?, ingredients?, allergens?, mealType?, imageUrl?, notes? }
const create = async (req, res, next) => {
  try {
    const { name, category, description, ingredients, allergens, mealType, imageUrl, notes } = req.body;
    if (!name) return res.status(400).json({ message: "Magaca cuntada waa waajib." });
    const food = await prisma.food.create({
      data: { name, category, description, ingredients, allergens, mealType, imageUrl, notes },
    });
    res.status(201).json({ food });
  } catch (err) {
    next(err);
  }
};

// PUT /api/foods/:id  — isActive is the soft-delete switch; a Food referenced
// by any MenuItem (past or present) is never hard-deleted.
const update = async (req, res, next) => {
  try {
    const { name, category, description, ingredients, allergens, mealType, imageUrl, notes, isActive } = req.body;
    const food = await prisma.food.update({
      where: { id: req.params.id },
      data: { name, category, description, ingredients, allergens, mealType, imageUrl, notes, isActive },
    });
    res.json({ food });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/foods/:id — hard delete; blocked if the food was ever used on
// a menu (historical menu records must not lose their food reference — use
// isActive instead to retire a food that's already in use).
const remove = async (req, res, next) => {
  try {
    const usageCount = await prisma.menuItem.count({ where: { foodId: req.params.id } });
    if (usageCount > 0) {
      return res.status(400).json({ message: "Cuntadan waxaa lagu isticmaalay menu hore. Isticmaal 'Xir' halkii aad u tirtiri lahayd." });
    }
    await prisma.food.delete({ where: { id: req.params.id } });
    res.json({ message: "Cuntada waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update, remove };
