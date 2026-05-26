const User = require("../models/User");
const Document = require("../models/Document");
const Attendance = require("../models/Attendance");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

// Helper to generate token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || "default_jwt_secret_key_12345",
        { expiresIn: "30d" }
    );
};

// Register User
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let profilePicture = "";
        if (req.file) {
            profilePicture = `/uploads/${req.file.filename}`;
        } else if (req.body.profilePicture) {
            profilePicture = req.body.profilePicture;
        }

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "user",
            phone,
            profilePicture,
            kycStatus: "pending"
        });

        const token = generateToken(newUser._id);
        const userResponse = newUser.toObject();
        delete userResponse.password;

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: userResponse
        });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user._id);
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: userResponse
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
    try {
        const { name, phone, profilePicture, currentPassword, newPassword } = req.body;
        
        let user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Handle password change if requested
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Incorrect current password"
                });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;

        // If profile picture is physically uploaded via multer
        if (req.file) {
            user.profilePicture = `/uploads/${req.file.filename}`;
        } else if (profilePicture !== undefined) {
            user.profilePicture = profilePicture;
        }

        await user.save();
        
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: userResponse
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Upload KYC Document
const uploadKyc = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a KYC document file (e.g. PDF, Image)"
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.kycUrl = `/uploads/${req.file.filename}`;
        user.kycStatus = "pending"; // Re-evaluate back to pending upon new upload
        await user.save();

        return res.status(200).json({
            success: true,
            message: "KYC document uploaded successfully and is currently pending verification",
            kycUrl: user.kycUrl,
            kycStatus: user.kycStatus
        });
    } catch (error) {
        console.error("Error uploading KYC document:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Retrieve User Specific Dashboard Quick Overview
const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;

        // Resolve matching Employee ID for attendance query
        const employee = await Employee.findOne({ email: req.user.email });
        const queryEmployeeId = employee ? employee._id : userId;

        // Documents
        const unsignedDocsCount = await Document.countDocuments({ userId, signed: false });
        
        // Notifications
        const unreadNotificationsCount = await Notification.countDocuments({ userId, isRead: false });

        // Today's attendance status
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayAttendance = await Attendance.findOne({
            employeeId: queryEmployeeId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        return res.status(200).json({
            success: true,
            dashboard: {
                profile: {
                    name: req.user.name,
                    email: req.user.email,
                    kycStatus: req.user.kycStatus,
                    role: req.user.role
                },
                todayAttendance: {
                    checkedIn: !!todayAttendance,
                    checkInTime: todayAttendance ? todayAttendance.checkIn : null,
                    checkOutTime: todayAttendance ? todayAttendance.checkOut : null
                },
                pendingTasks: {
                    unsignedDocuments: unsignedDocsCount,
                    unreadNotifications: unreadNotificationsCount
                }
            }
        });
    } catch (error) {
        console.error("Error loading user dashboard:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get All Users (Admin) - with investment count aggregation
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });

        // Aggregate investment counts per user
        const Investment = require("../models/Investment");
        const investmentCounts = await Investment.aggregate([
            { $group: { _id: "$userId", count: { $sum: 1 } } }
        ]);
        const countMap = {};
        investmentCounts.forEach(item => {
            countMap[item._id.toString()] = item.count;
        });

        const usersWithInvestments = users.map(user => {
            const userObj = user.toObject();
            userObj.investments = countMap[user._id.toString()] || 0;
            return userObj;
        });

        return res.status(200).json({
            success: true,
            users: usersWithInvestments
        });
    } catch (error) {
        console.error("Error fetching all users:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete User (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update User Status/Details (Admin) - block, activate, details, and role updates
const updateUserStatus = async (req, res) => {
    try {
        const { status, name, email, phone, kycStatus, role } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (status !== undefined) user.status = status;
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (kycStatus !== undefined) user.kycStatus = kycStatus;
        if (role !== undefined) user.role = role;

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            message: "User details updated successfully",
            user: userResponse
        });
    } catch (error) {
        console.error("Error updating user status/details:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    uploadKyc,
    getUserDashboardData,
    getAllUsers,
    deleteUser,
    updateUserStatus
};
