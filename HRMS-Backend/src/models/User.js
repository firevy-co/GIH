const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ["admin", "staff", "user"],
        default: "user"
    },
    phone: String,
    profilePicture: String,
    kycUrl: String,
    kycStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending"
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Blocked"],
        default: "Active"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);