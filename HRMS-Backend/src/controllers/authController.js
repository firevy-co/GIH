const User = require("../models/User");
const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
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

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "staff",
            phone,
            profilePicture,
        });
        await newUser.save();

        const userResponse = newUser.toObject();
        delete userResponse.password;

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: userResponse,
        });

    } catch (error) {
        console.error("Error in user registration:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "default_jwt_secret_key_12345",
            { expiresIn: "30d" }
        );

        const userResponse = user.toObject();
        delete userResponse.password;

        const employee = await Employee.findOne({ email: user.email });
        if (employee) {
            userResponse.department = employee.department;
            userResponse.designation = employee.designation;
            userResponse.employeeStatus = employee.status;
            userResponse.employeeId = employee._id;
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: userResponse,
            token,
        });

    } catch (error) {
        console.error("Error in user login:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

const getMe = async (req, res) => {
    try {
        const userObj = req.user.toObject();
        const employee = await Employee.findOne({ email: req.user.email });
        if (employee) {
            userObj.department = employee.department;
            userObj.designation = employee.designation;
            userObj.employeeStatus = employee.status;
            userObj.employeeId = employee._id;
        }

        return res.status(200).json({
            success: true,
            user: userObj,
        });
    } catch (error) {
        console.error("Error in fetching user profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide an email",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No user found with that email",
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");

        // Hash token and set to resetPasswordToken field
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now

        await user.save();

        // In development/testing, we return the token in the API response.
        return res.status(200).json({
            success: true,
            message: "Password reset token generated.",
            resetToken,
        });
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Token and newPassword are required",
            });
        }

        // Hash the received token to match the database token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        // Hash new password and save
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

const logoutUser = async (req, res) => {
    try {
        // Clear HTTP-only cookie if it is set
        res.cookie("token", "none", {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Error in logoutUser:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports = { registerUser, loginUser, getMe, forgotPassword, resetPassword, logoutUser };