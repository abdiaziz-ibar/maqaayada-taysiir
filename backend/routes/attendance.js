const express = require("express");
const { getRoster, recordAttendance, whoAte, whoDidNotEat, deleteAttendance } = require("../controllers/mealAttendanceController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", getRoster);
router.get("/who-ate", whoAte);
router.get("/who-did-not-eat", whoDidNotEat);
router.put("/:studentId", recordAttendance);
router.delete("/record/:id", authorize("admin"), deleteAttendance);

module.exports = router;
