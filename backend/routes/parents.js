const express = require("express");
const { listParents, getParent, createParent, updateParent } = require("../controllers/parentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", listParents);
router.get("/:id", getParent);
router.post("/", createParent);
router.put("/:id", updateParent);

module.exports = router;
