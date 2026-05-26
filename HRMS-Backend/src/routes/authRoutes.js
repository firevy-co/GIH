const express = require("express");
const { registerUser, loginUser, getMe, forgotPassword, resetPassword, logoutUser } = require("../controllers/authController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const router = Router();

function Router() {
    return express.Router();
}

// auth routes

router.get("/me", protect, getMe);
router.post("/register", upload.single("profilePicture"), registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logoutUser);

module.exports = router;