const prisma = require("../lib/prisma");

// GET /api/classes
const list = async (req, res, next) => {
  try {
    const classes = await prisma.class.findMany({ include: { sections: true }, orderBy: { order: "asc" } });
    res.json({ classes });
  } catch (err) {
    next(err);
  }
};

// POST /api/classes  { name, order? }
const create = async (req, res, next) => {
  try {
    const { name, order } = req.body;
    if (!name) return res.status(400).json({ message: "Magaca fasalka waa waajib." });
    const klass = await prisma.class.create({ data: { name, order: order ?? 0 } });
    res.status(201).json({ class: klass });
  } catch (err) {
    next(err);
  }
};

// PUT /api/classes/:id  { name?, order?, isActive? }
const update = async (req, res, next) => {
  try {
    const { name, order, isActive } = req.body;
    const klass = await prisma.class.update({ where: { id: req.params.id }, data: { name, order, isActive } });
    res.json({ class: klass });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/classes/:id — students in this class have classId set to null (SetNull).
const remove = async (req, res, next) => {
  try {
    await prisma.class.delete({ where: { id: req.params.id } });
    res.json({ message: "Fasalka waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

// POST /api/classes/:id/sections  { name }
const addSection = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Magaca qaybta (section) waa waajib." });
    const section = await prisma.section.create({ data: { classId: req.params.id, name } });
    res.status(201).json({ section });
  } catch (err) {
    next(err);
  }
};

// PUT /api/classes/:classId/sections/:sectionId  { name }
const updateSection = async (req, res, next) => {
  try {
    const { name } = req.body;
    const section = await prisma.section.update({ where: { id: req.params.sectionId }, data: { name } });
    res.json({ section });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/classes/:classId/sections/:sectionId
const removeSection = async (req, res, next) => {
  try {
    await prisma.section.delete({ where: { id: req.params.sectionId } });
    res.json({ message: "Qaybta (section) waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update, remove, addSection, updateSection, removeSection };
