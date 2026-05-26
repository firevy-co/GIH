const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const User = require("../models/User");
const mongoose = require("mongoose");

// Helper to resolve identifier to Employee document, supporting User ID, Employee ID, or email
const resolveEmployee = async (identifier) => {
    if (!identifier) return null;
    
    if (mongoose.Types.ObjectId.isValid(identifier)) {
        const employee = await Employee.findById(identifier);
        if (employee) return employee;
    }
    
    // 2. Try to find User by ID or Email
    let user = null;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
        user = await User.findById(identifier);
    }
    if (!user) {
        user = await User.findOne({ email: identifier });
    }
    
    // 3. If User found, find Employee by User's email
    if (user) {
        let employee = await Employee.findOne({ email: user.email });
        if (employee) return employee;

        // Auto-create Employee profile for registered user if missing
        try {
            employee = await Employee.create({
                name: user.name || "Default Staff Name",
                email: user.email,
                department: "IT",
                designation: user.role === "admin" ? "Admin" : "Staff",
                status: "active"
            });
            console.log(`Auto-created employee record for user: ${user.email}`);
            return employee;
        } catch (err) {
            console.error("Auto-create employee failed:", err);
        }
    }
    
    // 4. Try to find Employee by email directly
    const employeeByEmail = await Employee.findOne({ email: identifier });
    if (employeeByEmail) return employeeByEmail;

    // 5. Try email string detection to check user & auto-create
    if (typeof identifier === "string" && identifier.includes("@")) {
        const userByEmail = await User.findOne({ email: identifier });
        if (userByEmail) {
            try {
                const employee = await Employee.create({
                    name: userByEmail.name || "Default Staff Name",
                    email: userByEmail.email,
                    department: "IT",
                    designation: userByEmail.role === "admin" ? "Admin" : "Staff",
                    status: "active"
                });
                console.log(`Auto-created employee record for email: ${identifier}`);
                return employee;
            } catch (err) {
                console.error("Auto-create employee by email failed:", err);
            }
        }
    }
    
    return null;
};

// Apply for Leave
const applyLeave = async (req, res) => {
    try {
        const { employeeId, leaveType, fromDate, toDate, reason } = req.body;

        if (!employeeId || !leaveType || !fromDate || !toDate || !reason) {
            return res.status(400).json({
                success: false,
                message: "All fields are required (employeeId, leaveType, fromDate, toDate, reason)"
            });
        }

        // Verify if employee exists using resolveEmployee helper
        const employee = await resolveEmployee(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee record not found for this user"
            });
        }
        const finalEmployeeId = employee._id;

        // Validate date ranges
        const start = new Date(fromDate);
        const end = new Date(toDate);

        if (start > end) {
            return res.status(400).json({
                success: false,
                message: "fromDate must be before or equal to toDate"
            });
        }

        const leave = await Leave.create({
            employeeId: finalEmployeeId,
            leaveType,
            fromDate: start,
            toDate: end,
            reason,
            status: "pending" // Default status
        });

        return res.status(201).json({
            success: true,
            message: "Leave application submitted successfully",
            leave
        });
    } catch (error) {
        console.error("Error applying for leave:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Approve Leave Request (Admin only action)
const approveLeave = async (req, res) => {
    try {
        const leaveId = req.params.id;

        const leave = await Leave.findById(leaveId);
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        if (leave.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Leave request has already been processed and is currently ${leave.status}`
            });
        }

        leave.status = "approved";
        await leave.save();

        return res.status(200).json({
            success: true,
            message: "Leave request approved successfully",
            leave
        });
    } catch (error) {
        console.error("Error approving leave request:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Reject Leave Request (Admin only action)
const rejectLeave = async (req, res) => {
    try {
        const leaveId = req.params.id;

        const leave = await Leave.findById(leaveId);
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        if (leave.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Leave request has already been processed and is currently ${leave.status}`
            });
        }

        leave.status = "rejected";
        await leave.save();

        return res.status(200).json({
            success: true,
            message: "Leave request rejected successfully",
            leave
        });
    } catch (error) {
        console.error("Error rejecting leave request:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Leave History (With optional filters)
const getLeaveHistory = async (req, res) => {
    try {
        const { employeeId, status, leaveType } = req.query;
        const query = {};

        if (employeeId) {
            const employee = await resolveEmployee(employeeId);
            query.employeeId = employee ? employee._id : employeeId;
        }

        if (status) query.status = status;
        if (leaveType) query.leaveType = leaveType;

        const leaveHistory = await Leave.find(query)
            .populate("employeeId", "name email department designation")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: leaveHistory.length,
            leaves: leaveHistory
        });
    } catch (error) {
        console.error("Error fetching leave history:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    applyLeave,
    approveLeave,
    rejectLeave,
    getLeaveHistory
};
