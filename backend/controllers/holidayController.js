const prisma = require("../lib/prisma");

// GET /api/holidays
const list = async (req, res, next) => {
  try {
    const holidays = await prisma.holiday.findMany({ orderBy: { startDate: "asc" } });
    res.json({ holidays });
  } catch (err) {
    next(err);
  }
};

// POST /api/holidays  { name, startDate, endDate, type, description? }
const create = async (req, res, next) => {
  try {
    const { name, startDate, endDate, type, description } = req.body;
    if (!name || !startDate || !endDate || !type) {
      return res.status(400).json({ message: "Magaca, taariikhaha, iyo nooca fasaxa waa waajib." });
    }
    const holiday = await prisma.holiday.create({
      data: { name, startDate: new Date(startDate), endDate: new Date(endDate), type, description },
    });
    res.status(201).json({ holiday });
  } catch (err) {
    next(err);
  }
};

// PUT /api/holidays/:id
const update = async (req, res, next) => {
  try {
    const { name, startDate, endDate, type, description } = req.body;
    const holiday = await prisma.holiday.update({
      where: { id: req.params.id },
      data: {
        name,
        type,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
    res.json({ holiday });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/holidays/:id — related FeeAdjustment rows keep holidayId=null (SetNull).
const remove = async (req, res, next) => {
  try {
    await prisma.holiday.delete({ where: { id: req.params.id } });
    res.json({ message: "Fasaxa waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update, remove };
