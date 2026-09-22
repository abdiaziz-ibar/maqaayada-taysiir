const express = require("express");
const { listStudents, searchStudents, getStudent, createStudent, updateStudent } = require("../controllers/studentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", listStudents);
router.get("/search", searchStudents);
router.get("/:id", getStudent);
router.post("/", createStudent);
router.put("/:id", updateStudent);

module.exports = router;
