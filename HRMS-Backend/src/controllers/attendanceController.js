const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const User = require("../models/User");
const mongoose = require("mongoose");

// Helper to resolve identifier to Employee document, supporting User ID, Employee ID, or email
const resolveEmployee = async (identifier) => {
    if (!identifier) return null;
    
    // 1. Try to find Employee directly by ID if valid
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

// Check-In Employee
const checkIn = async (req, res) => {
    try {
        const { employeeId, location, checkInTime, status } = req.body;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required"
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

        // Get start and end of current day to prevent duplicate check-in
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const existingAttendance = await Attendance.findOne({
            employeeId: finalEmployeeId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: "Employee already checked in for today",
                attendance: existingAttendance
            });
        }

        // Format current time as string if not provided (e.g., "09:30 AM")
        const now = new Date();
        const formattedTime = checkInTime || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const attendance = await Attendance.create({
            employeeId: finalEmployeeId,
            date: now,
            checkIn: formattedTime,
            status: status || "present",
            location
        });

        return res.status(201).json({
            success: true,
            message: "Checked in successfully",
            attendance
        });
    } catch (error) {
        console.error("Error checking in:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Check-Out Employee
const checkOut = async (req, res) => {
    try {
        const { employeeId, checkOutTime } = req.body;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required"
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

        // Get start and end of current day to find today's check-in
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const attendance = await Attendance.findOne({
            employeeId: finalEmployeeId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "No check-in record found for today. Please check-in first."
            });
        }

        if (attendance.checkOut) {
            return res.status(400).json({
                success: false,
                message: "Employee already checked out for today",
                attendance
            });
        }

        // Format current time as string if not provided (e.g., "06:00 PM")
        const now = new Date();
        const formattedTime = checkOutTime || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        attendance.checkOut = formattedTime;
        await attendance.save();

        return res.status(200).json({
            success: true,
            message: "Checked out successfully",
            attendance
        });
    } catch (error) {
        console.error("Error checking out:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all attendance records (with optional filters)
const getAllAttendance = async (req, res) => {
    try {
        const { employeeId, status, date } = req.query;
        const query = {};

        if (employeeId) {
            const employee = await resolveEmployee(employeeId);
            query.employeeId = employee ? employee._id : employeeId;
        }

        if (status) query.status = status;
        
        if (date) {
            const startOfQueryDay = new Date(date);
            startOfQueryDay.setHours(0, 0, 0, 0);
            
            const endOfQueryDay = new Date(date);
            endOfQueryDay.setHours(23, 59, 59, 999);
            
            query.date = { $gte: startOfQueryDay, $lte: endOfQueryDay };
        }

        const attendanceRecords = await Attendance.find(query)
            .populate("employeeId", "name email department designation")
            .sort({ date: -1 });

        return res.status(200).json({
            success: true,
            count: attendanceRecords.length,
            attendance: attendanceRecords
        });
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get attendance history for a single Employee
const getEmployeeAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;

        // Verify if employee exists using resolveEmployee helper
        const employee = await resolveEmployee(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }
        const finalEmployeeId = employee._id;

        const attendanceRecords = await Attendance.find({ employeeId: finalEmployeeId }).sort({ date: -1 });

        return res.status(200).json({
            success: true,
            count: attendanceRecords.length,
            attendance: attendanceRecords
        });
    } catch (error) {
        console.error("Error fetching employee attendance:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update Attendance (Admin manual adjustment)
const updateAttendance = async (req, res) => {
    try {
        const { checkIn, checkOut, status, location, date } = req.body;
        
        let attendance = await Attendance.findById(req.params.id);
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            { checkIn, checkOut, status, location, date },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Attendance record updated successfully",
            attendance
        });
    } catch (error) {
        console.error("Error updating attendance record:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete Attendance record
const deleteAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        await Attendance.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Attendance record deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting attendance record:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    checkIn,
    checkOut,
    getAllAttendance,
    getEmployeeAttendance,
    updateAttendance,
    deleteAttendance
};
