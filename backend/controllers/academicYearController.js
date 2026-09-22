const prisma = require("../lib/prisma");
const { logAudit } = require("../utils/auditLog");

const list = async (req, res, next) => {
  try {
    const years = await prisma.academicYear.findMany({ orderBy: { startDate: "desc" } });
    res.json({ academicYears: years });
  } catch (err) {
    next(err);
  }
};

// POST /api/academic-years  { name, startDate, endDate, isActive? }
const create = async (req, res, next) => {
  try {
    const { name, startDate, endDate, isActive } = req.body;
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: "Magaca, taariikhda bilowga iyo dhammaadka waa waajib." });
    }
    if (isActive) {
      await prisma.academicYear.updateMany({ data: { isActive: false }, where: { isActive: true } });
    }
    const year = await prisma.academicYear.create({
      data: { name, startDate: new Date(startDate), endDate: new Date(endDate), isActive: Boolean(isActive) },
    });
    logAudit(prisma, { userId: req.user._id, action: "create", module: "academic_years", recordId: year.id, newValue: year });
    res.status(201).json({ academicYear: year });
  } catch (err) {
    next(err);
  }
};

// PUT /api/academic-years/:id  { name?, startDate?, endDate?, isActive? }
const update = async (req, res, next) => {
  try {
    const { name, startDate, endDate, isActive } = req.body;
    if (isActive) {
      await prisma.academicYear.updateMany({ data: { isActive: false }, where: { isActive: true } });
    }
    const year = await prisma.academicYear.update({
      where: { id: req.params.id },
      data: {
        name,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
      },
    });
    res.json({ academicYear: year });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/academic-years/:id — blocked if any invoice was ever generated
// under it (deleting would otherwise cascade-wipe every one of those invoices).
const remove = async (req, res, next) => {
  try {
    const invoiceCount = await prisma.invoice.count({ where: { academicYearId: req.params.id } });
    if (invoiceCount > 0) {
      return res.status(400).json({ message: `Sanadkan waxaa la sameeyay ${invoiceCount} invoice. Marka hore ka saar invoice-yada ka hor intaadan tirtirin.` });
    }
    await prisma.academicYear.delete({ where: { id: req.params.id } });
    res.json({ message: "Sanad Dugsiyeedka waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update, remove };
