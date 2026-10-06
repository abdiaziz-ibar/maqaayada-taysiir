const express = require("express");
const { generate, list, remove, reversePayment } = require("../controllers/invoiceController");
const { protect, authorize, requireFinance } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", list);
router.post("/generate", generate);
router.post("/:id/reverse-payment", requireFinance, reversePayment);
router.delete("/:id", authorize("admin"), remove);

module.exports = router;
