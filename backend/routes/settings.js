const express = require("express");
const { getSettings, updateSettings } = require("../controllers/settingsController");
const { protect, requireFinance } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", getSettings);
router.put("/", requireFinance, updateSettings);

module.exports = router;
