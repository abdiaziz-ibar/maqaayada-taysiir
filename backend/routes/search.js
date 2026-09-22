const express = require("express");
const { search } = require("../controllers/searchController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, search);

module.exports = router;
