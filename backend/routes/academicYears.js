const express = require("express");
const { list, create, update, remove } = require("../controllers/academicYearController");
const { protect, requireFinance, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", list);
router.post("/", requireFinance, create);
router.put("/:id", requireFinance, update);
router.delete("/:id", authorize("admin"), remove);

module.exports = router;
