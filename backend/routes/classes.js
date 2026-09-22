const express = require("express");
const { list, create, update, remove, addSection, updateSection, removeSection } = require("../controllers/classController");
const { protect, requireFinance, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", list);
router.post("/", requireFinance, create);
router.put("/:id", requireFinance, update);
router.delete("/:id", authorize("admin"), remove);
router.post("/:id/sections", requireFinance, addSection);
router.put("/:id/sections/:sectionId", requireFinance, updateSection);
router.delete("/:id/sections/:sectionId", authorize("admin"), removeSection);

module.exports = router;
