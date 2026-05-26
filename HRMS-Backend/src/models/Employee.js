const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Employee name is required"]
    },
    email: {
        type: String,
        required: [true, "Employee email is required"],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email"
        ]
    },
    phone: {
        type: String
    },
    department: {
        type: String,
        required: [true, "Department is required"]
    },
    designation: {
        type: String,
        required: [true, "Designation is required"]
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Employee", employeeSchema);
