const express = require("express");
const { list, create, update, remove } = require("../controllers/expenseController");
const { protect, requireFinance, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", list);
router.post("/", create); // any staff can log an expense (e.g. buying supplies)
router.put("/:id", requireFinance, update);
router.delete("/:id", authorize("admin"), remove);

module.exports = router;
