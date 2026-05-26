const Notification = require("../models/Notification");
const User = require("../models/User");

// Send / Create a Notification
const sendNotification = async (req, res) => {
    try {
        const { userId, title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "Title and message are required"
            });
        }

        if (userId === "all") {
            const allUsers = await User.find({});
            const notificationsData = allUsers.map(u => ({
                userId: u._id,
                title,
                message,
                isRead: false
            }));
            await Notification.insertMany(notificationsData);

            return res.status(201).json({
                success: true,
                message: `Broadcasted notification to ${allUsers.length} users successfully`,
                notification: { title, message, userId: "all", isRead: false }
            });
        }

        const notification = await Notification.create({
            userId: userId || req.user._id, // Assign to target user or self
            title,
            message,
            isRead: false
        });

        return res.status(201).json({
            success: true,
            message: "Notification sent successfully",
            notification
        });
    } catch (error) {
        console.error("Error sending notification:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all notifications (restricted to owner or admin)
const getNotifications = async (req, res) => {
    try {
        const { userId, isRead } = req.query;
        const query = {};

        // Security Policy: Standard users can only retrieve their own notifications
        if (req.user.role !== "admin") {
            query.userId = req.user._id;
        } else {
            // Admins can query by userId
            if (userId) query.userId = userId;
        }

        if (isRead !== undefined) {
            query.isRead = isRead === "true";
        }

        const notifications = await Notification.find(query)
            .populate("userId", "name email department designation")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
    try {
        let notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        // Security check: Only the owner of the notification can mark it as read
        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to modify this notification"
            });
        }

        if (notification.isRead) {
            return res.status(400).json({
                success: false,
                message: "Notification is already marked as read"
            });
        }

        notification.isRead = true;
        await notification.save();

        return res.status(200).json({
            success: true,
            message: "Notification marked as read successfully",
            notification
        });
    } catch (error) {
        console.error("Error updating notification status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    sendNotification,
    getNotifications,
    markAsRead
};
