const jwt = require("jsonwebtoken");

const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// System user (admin/staff) token.
const generateToken = (userId) =>
  jwt.sign({ id: userId, type: "user" }, process.env.JWT_SECRET, { expiresIn: EXPIRES_IN });

// Parent portal token — kept as a distinct `type` so a stolen parent token
// can never be replayed against admin-only routes, and vice versa.
const generateParentToken = (parentId) =>
  jwt.sign({ id: parentId, type: "parent" }, process.env.JWT_SECRET, { expiresIn: EXPIRES_IN });

module.exports = { generateToken, generateParentToken };
