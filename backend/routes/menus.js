const express = require("express");
const { list, setMenu, copyDay, clearMenu } = require("../controllers/menuController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", list);
router.put("/", setMenu);
router.post("/copy", copyDay);
router.delete("/", authorize("admin"), clearMenu);

module.exports = router;
