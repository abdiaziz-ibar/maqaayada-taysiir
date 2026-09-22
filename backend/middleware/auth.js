const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Ma jiro token. Fadlan soo gal (login)." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "user") {
      return res.status(401).json({ message: "Token khalad ah." });
    }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "Isticmaale sax ah lama helin." });
    }
    const { password, ...safeUser } = user;
    req.user = { ...safeUser, _id: user.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token khalad ah ama wakhtigiisu dhacay." });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Ma lihid ogolaanshaha (permission) tallaabadan." });
  }
  next();
};

// Financial actions (fee amounts, adjustments, settings): admins always
// pass; staff need the canManageFinance flag an admin has explicitly set.
const requireFinance = (req, res, next) => {
  if (req.user.role === "admin" || req.user.canManageFinance) return next();
  return res.status(403).json({ message: "Kaliya admin ama shaqaale loo ogolaaday ayaa tan sameyn kara." });
};

module.exports = { protect, authorize, requireFinance };
