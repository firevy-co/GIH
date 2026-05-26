const express = require("express");
const {
    checkIn,
    checkOut,
    getAllAttendance,
    getEmployeeAttendance,
    updateAttendance,
    deleteAttendance
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const router = express.Router();

// Check-in and check-out (Accessible to authenticated users)
router.post("/check-in", protect, checkIn);
router.post("/check-out", protect, checkOut);

// Get all attendance logs (Authenticated users, admins can filter/retrieve all)
router.get("/", protect, getAllAttendance);

// Get specific employee attendance logs
router.get("/employee/:employeeId", protect, getEmployeeAttendance);

// Admin manual adjustments of attendance
router.put("/:id", protect, authorize("admin"), updateAttendance);
router.delete("/:id", protect, authorize("admin"), deleteAttendance);

module.exports = router;
