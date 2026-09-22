const express = require("express");
const {
  register,
  login,
  changePassword,
  getMe,
  getStudentMeals,
  getPayments,
} = require("../controllers/parentPortalController");
const { protectParent } = require("../middleware/parentAuth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/change-password", protectParent, changePassword);
router.get("/me", protectParent, getMe);
router.get("/students/:id/meals", protectParent, getStudentMeals);
router.get("/payments", protectParent, getPayments);

module.exports = router;
