const express = require("express");
const { createPayment, listPayments, getReceipt, deletePayment } = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", listPayments);
router.post("/", createPayment);
router.get("/:id/receipt", getReceipt);
router.delete("/:id", authorize("admin"), deletePayment);

module.exports = router;
