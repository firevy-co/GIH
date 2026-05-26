const express = require("express");
const {
    sendNotification,
    getNotifications,
    markAsRead
} = require("../controllers/notificationController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

// Send / Create notification (Accessible to authenticated users/admins)
router.post("/send", protect, sendNotification);

// Get notifications list (Accessible to authenticated users, filtered by owner)
router.get("/", protect, getNotifications);

// Mark a specific notification as read (Restricted to owner)
router.put("/read/:id", protect, markAsRead);

module.exports = router;
