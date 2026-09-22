const express = require("express");
const { list, create, remove } = require("../controllers/feeAdjustmentController");
const { protect, requireFinance, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", list);
router.post("/", requireFinance, create);
router.delete("/:id", authorize("admin"), remove);

module.exports = router;
