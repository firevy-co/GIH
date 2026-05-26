const express = require("express");
const { 
    getAdminDashboard, 
    getUserDashboard, 
    getAnalytics 
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const router = express.Router();

// Admin Dashboard Summary (Restricted to Admin)
router.get("/admin", protect, authorize("admin"), getAdminDashboard);

// User Personal Dashboard Summary (Authenticated users)
router.get("/user", protect, getUserDashboard);

// Staff Personal Dashboard Summary (Authenticated users)
router.get("/staff", protect, getUserDashboard);

// Global Analytics and Graphs Data (Restricted to Admin)
router.get("/analytics", protect, authorize("admin"), getAnalytics);

module.exports = router;
