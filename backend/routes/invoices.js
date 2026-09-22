const express = require("express");
const { generate, list, remove } = require("../controllers/invoiceController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", list);
router.post("/generate", generate);
router.delete("/:id", authorize("admin"), remove);

module.exports = router;
