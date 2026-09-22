const express = require("express");
const { list } = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, list);

module.exports = router;
