const crypto = require("crypto");

// Human-readable-enough, collision-safe receipt number: date + random suffix.
const generateReceiptNumber = () => {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `RCT-${day}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
};

module.exports = { generateReceiptNumber };
