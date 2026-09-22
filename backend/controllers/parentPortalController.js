const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { generateParentToken } = require("../utils/generateToken");
const { serializeParent } = require("../utils/serialize");
const { getLockRemaining, failureResult, reset, lockedMessage } = require("../utils/loginLimiter");

// POST /api/parent-portal/register  { phone, password }
const register = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: "Phone iyo Password waa waajib." });
    if (password.length < 6) return res.status(400).json({ message: "Password-ku waa inuu ahaadaa ugu yaraan 6 xaraf." });

    const parent = await prisma.parent.findFirst({ where: { phone } });
    if (!parent) return res.status(404).json({ message: "Lambarkan lagama helin waalid diiwaan gashan. La xiriir maqaayda." });
    if (parent.password) return res.status(400).json({ message: "Xisaabtan horey ayaa loo diiwaan geliyay. Isticmaal 'Soo Gal'." });

    const hashed = await bcrypt.hash(password, 10);
    const updated = await prisma.parent.update({ where: { id: parent.id }, data: { password: hashed } });
    const token = generateParentToken(updated.id);
    res.json({ token, parent: serializeParent(updated) });
  } catch (err) {
    next(err);
  }
};

// POST /api/parent-portal/login  { phone, password }
const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: "Phone iyo Password waa waajib." });

    const lockedFor = getLockRemaining("parent", phone);
    if (lockedFor > 0) return res.status(429).json({ message: lockedMessage(lockedFor) });

    const parent = await prisma.parent.findFirst({ where: { phone } });
    if (!parent || !parent.password) {
      return res.status(404).json({ message: "Xisaabtan lama helin. Fadlan marka hore dhig password-kaaga." });
    }

    const isMatch = await bcrypt.compare(password, parent.password);
    if (!isMatch) {
      const { status, message } = failureResult("parent", phone, "Phone ama Password khalad ah.");
      return res.status(status).json({ message });
    }
    reset("parent", phone);
    const token = generateParentToken(parent.id);
    res.json({ token, parent: serializeParent(parent) });
  } catch (err) {
    next(err);
  }
};

// POST /api/parent-portal/change-password  (protectParent)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Password-ka hadda iyo kan cusub waa waajib." });
    if (newPassword.length < 6) return res.status(400).json({ message: "Password-ku waa inuu ahaadaa ugu yaraan 6 xaraf." });

    const parent = await prisma.parent.findUnique({ where: { id: req.parentId } });
    if (!parent || !parent.password) return res.status(404).json({ message: "Waalidka lama helin." });

    const lockedFor = getLockRemaining("parent", parent.phone);
    if (lockedFor > 0) return res.status(429).json({ message: lockedMessage(lockedFor) });

    const isMatch = await bcrypt.compare(currentPassword, parent.password);
    if (!isMatch) {
      const { status, message } = failureResult("parent", parent.phone, "Password-ka hadda jira waa khalad.");
      return res.status(status).json({ message });
    }
    if (currentPassword === newPassword) return res.status(400).json({ message: "Password-ka cusub waa inuu ka duwanaadaa kan hadda jira." });

    await prisma.parent.update({ where: { id: parent.id }, data: { password: await bcrypt.hash(newPassword, 10) } });
    reset("parent", parent.phone);
    res.json({ message: "Password-ka waa la beddelay." });
  } catch (err) {
    next(err);
  }
};

// GET /api/parent-portal/me  (protectParent)
// Only ever reads req.parentId — a parent can only ever see their own
// children, invoices, and totals.
const getMe = async (req, res, next) => {
  try {
    const parent = await prisma.parent.findUnique({ where: { id: req.parentId } });
    if (!parent) return res.status(404).json({ message: "Waalidka lama helin." });

    const students = await prisma.student.findMany({
      where: { parentId: parent.id },
      include: {
        class: true,
        mealPlan: true,
        invoices: { orderBy: [{ year: "desc" }, { month: "desc" }] },
      },
      orderBy: { createdAt: "asc" },
    });

    const totalOwed = students.reduce(
      (sum, s) => sum + s.invoices.reduce((iSum, inv) => iSum + (inv.amountDue - inv.amountPaid), 0),
      0
    );

    res.json({ parent: serializeParent(parent), totalOwed, students });
  } catch (err) {
    next(err);
  }
};

// GET /api/parent-portal/students/:id/meals  (protectParent)
// Scoped to the parent's own student.
const getStudentMeals = async (req, res, next) => {
  try {
    const student = await prisma.student.findFirst({ where: { id: req.params.id, parentId: req.parentId } });
    if (!student) return res.status(404).json({ message: "Ardaygan lama helin." });

    const attendances = await prisma.mealAttendance.findMany({ where: { studentId: student.id }, orderBy: { date: "desc" } });
    res.json({ student, attendances });
  } catch (err) {
    next(err);
  }
};

// GET /api/parent-portal/payments  (protectParent)
const getPayments = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { parentId: req.parentId },
      include: { allocations: { include: { invoice: { include: { student: true } } } } },
      orderBy: { paymentDate: "desc" },
    });
    res.json({ payments });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, changePassword, getMe, getStudentMeals, getPayments };
