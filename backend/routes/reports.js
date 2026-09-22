const express = require("express");
const { outstandingBalances, monthlyPaymentReport, annualReport, studentMealHistory } = require("../controllers/reportController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/outstanding-balances", outstandingBalances);
router.get("/monthly-payments", monthlyPaymentReport);
router.get("/annual", annualReport);
router.get("/student-meal-history/:studentId", studentMealHistory);

module.exports = router;
