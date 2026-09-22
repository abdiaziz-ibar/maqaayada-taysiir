const express = require("express");
const { create, list, markPaid, remove } = require("../controllers/occasionalMealController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", list);
router.post("/", create);
router.post("/:id/pay", markPaid);
router.delete("/:id", authorize("admin"), remove);

module.exports = router;
