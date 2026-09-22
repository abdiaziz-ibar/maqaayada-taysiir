const express = require("express");
const { list, create, update, remove } = require("../controllers/foodController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", list);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", authorize("admin"), remove);

module.exports = router;
