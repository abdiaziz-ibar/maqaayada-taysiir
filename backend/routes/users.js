const express = require("express");
const { listUsers, createUser, updateUser, deleteUser, unlockUser } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/", listUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.post("/:id/unlock", unlockUser);
router.delete("/:id", deleteUser);

module.exports = router;
