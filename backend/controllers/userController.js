const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { serializeUser } = require("../utils/serialize");
const { logAudit } = require("../utils/auditLog");

// GET /api/users
const listUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ users: users.map(serializeUser) });
  } catch (err) {
    next(err);
  }
};

// POST /api/users  { fullName, username, password, role, canManageFinance? }
const createUser = async (req, res, next) => {
  try {
    const { fullName, username, password, role, canManageFinance } = req.body;
    if (!fullName || !username || !password) {
      return res.status(400).json({ message: "Magaca, username, iyo password waa waajib." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password-ku waa inuu ahaadaa ugu yaraan 6 xaraf." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        fullName,
        username: username.toLowerCase(),
        password: hashed,
        role: role === "admin" ? "admin" : "staff",
        canManageFinance: Boolean(canManageFinance),
      },
    });
    logAudit(prisma, { userId: req.user._id, action: "create", module: "users", recordId: user.id, newValue: serializeUser(user) });
    res.status(201).json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id  { fullName?, role?, canManageFinance?, status?, password? }
const updateUser = async (req, res, next) => {
  try {
    const before = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!before) return res.status(404).json({ message: "Isticmaalaha lama helin." });

    const { fullName, role, canManageFinance, status, password } = req.body;
    const data = {
      fullName,
      role: role === "admin" || role === "staff" ? role : undefined,
      canManageFinance: canManageFinance !== undefined ? Boolean(canManageFinance) : undefined,
      status,
    };
    if (password) {
      if (password.length < 6) return res.status(400).json({ message: "Password-ku waa inuu ahaadaa ugu yaraan 6 xaraf." });
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    logAudit(prisma, {
      userId: req.user._id,
      action: "update",
      module: "users",
      recordId: user.id,
      previousValue: serializeUser(before),
      newValue: serializeUser(user),
    });
    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id) {
      return res.status(400).json({ message: "Isma tirtiri kartid xisaabtaada aad hadda ku jirto." });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "Isticmaalaha waa la tirtiray." });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, createUser, updateUser, deleteUser };
