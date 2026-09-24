const express = require("express");
const { outstandingBalances, monthlyPaymentReport, annualReport, studentMealHistory, profitAndLoss } = require("../controllers/reportController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/outstanding-balances", outstandingBalances);
router.get("/monthly-payments", monthlyPaymentReport);
router.get("/annual", annualReport);
router.get("/student-meal-history/:studentId", studentMealHistory);
router.get("/profit-loss", profitAndLoss);

module.exports = router;
