const express = require("express");
const {
    applyLeave,
    approveLeave,
    rejectLeave,
    getLeaveHistory
} = require("../controllers/leaveController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const router = express.Router();

// Apply for leave (Accessible to authenticated users)
router.post("/apply", protect, applyLeave);

// Get leave history (Accessible to authenticated users)
router.get("/history", protect, getLeaveHistory);

// Admin-only actions for approving/rejecting leave requests
router.put("/approve/:id", protect, authorize("admin"), approveLeave);
router.put("/reject/:id", protect, authorize("admin"), rejectLeave);

module.exports = router;
