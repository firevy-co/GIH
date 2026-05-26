const express = require("express");
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    uploadKyc,
    getUserDashboardData,
    getAllUsers,
    deleteUser,
    updateUserStatus
} = require("../controllers/userController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

// Public Authentication Endpoints
router.post("/register", upload.single("profilePicture"), registerUser);
router.post("/login", loginUser);

// Protected Profile & Dashboard Endpoints
router.get("/profile", protect, getUserProfile);
router.put("/update-profile", protect, upload.single("profilePicture"), updateUserProfile);
router.post("/upload-kyc", protect, upload.single("kyc"), uploadKyc);
router.get("/dashboard", protect, getUserDashboardData);

// Admin and Staff User Management Endpoints
router.get("/all", protect, authorize("admin", "staff"), getAllUsers);
router.delete("/:id", protect, authorize("admin"), deleteUser);
router.put("/:id/status", protect, authorize("admin"), updateUserStatus);

module.exports = router;
