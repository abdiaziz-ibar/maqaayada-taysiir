const express = require("express");
const { list } = require("../controllers/auditLogController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, authorize("admin"), list);

module.exports = router;
