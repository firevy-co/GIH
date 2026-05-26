const User = require("../models/User");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Investment = require("../models/Investment");
const Document = require("../models/Document");
const Notification = require("../models/Notification");

// Get start and end of current day helper
const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

// Admin Dashboard Summary
const getAdminDashboard = async (req, res) => {
    try {
        const { start: todayStart, end: todayEnd } = getTodayRange();

        // 1. Employee and User Counts
        const totalUsers = await User.countDocuments();
        const totalEmployees = await Employee.countDocuments();
        const activeEmployees = await Employee.countDocuments({ status: "active" });

        // 2. Today's Attendance Summary
        const presentToday = await Attendance.countDocuments({
            date: { $gte: todayStart, $lte: todayEnd },
            status: "present"
        });
        const absentToday = await Attendance.countDocuments({
            date: { $gte: todayStart, $lte: todayEnd },
            status: "absent"
        });
        const halfDayToday = await Attendance.countDocuments({
            date: { $gte: todayStart, $lte: todayEnd },
            status: "half-day"
        });

        // 3. Leave Requests Summary
        const pendingLeaves = await Leave.countDocuments({ status: "pending" });
        const approvedLeaves = await Leave.countDocuments({ status: "approved" });
        const rejectedLeaves = await Leave.countDocuments({ status: "rejected" });

        // 4. Investment Aggregations
        const totalInvestments = await Investment.aggregate([
            { $match: { status: "active" } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);
        const activeInvestmentsSum = totalInvestments.length > 0 ? totalInvestments[0].totalAmount : 0;

        // 5. Document Management
        const totalDocuments = await Document.countDocuments();
        const signedDocuments = await Document.countDocuments({ signed: true });
        const pendingSignatures = await Document.countDocuments({ signed: false });

        return res.status(200).json({
            success: true,
            dashboard: {
                organization: {
                    totalUsers,
                    totalEmployees,
                    activeEmployees
                },
                todayAttendance: {
                    present: presentToday,
                    absent: absentToday,
                    halfDay: halfDayToday
                },
                leaves: {
                    pending: pendingLeaves,
                    approved: approvedLeaves,
                    rejected: rejectedLeaves
                },
                financials: {
                    activeInvestmentsSum
                },
                documents: {
                    total: totalDocuments,
                    signed: signedDocuments,
                    pendingSignatures
                }
            }
        });
    } catch (error) {
        console.error("Error generating admin dashboard summary:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// User/Staff Personal Dashboard Summary
const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find matching Employee ID for attendance and leaves queries
        const employee = await Employee.findOne({ email: req.user.email });
        const queryEmployeeId = employee ? employee._id : userId;

        const { start: todayStart, end: todayEnd } = getTodayRange();

        // 1. Personal Attendance
        const totalAttendanceLogs = await Attendance.find({ employeeId: queryEmployeeId });
        const presentDays = totalAttendanceLogs.filter(a => a.status === "present").length;
        const absentDays = totalAttendanceLogs.filter(a => a.status === "absent").length;
        const halfDays = totalAttendanceLogs.filter(a => a.status === "half-day").length;

        const todayAttendance = await Attendance.findOne({
            employeeId: queryEmployeeId,
            date: { $gte: todayStart, $lte: todayEnd }
        });

        // 2. Personal Leaves
        const leavesApplied = await Leave.countDocuments({ employeeId: queryEmployeeId });
        const pendingLeaves = await Leave.countDocuments({ employeeId: queryEmployeeId, status: "pending" });
        const approvedLeaves = await Leave.countDocuments({ employeeId: queryEmployeeId, status: "approved" });
        const rejectedLeaves = await Leave.countDocuments({ employeeId: queryEmployeeId, status: "rejected" });

        // 3. Personal Investments
        const myInvestments = await Investment.find({ userId });
        const totalInvestedAmount = myInvestments
            .filter(i => i.status === "active")
            .reduce((sum, current) => sum + current.amount, 0);

        // 4. Personal Documents
        const totalAssignedDocs = await Document.countDocuments({ userId });
        const signedDocs = await Document.countDocuments({ userId, signed: true });
        const unsignedDocs = await Document.countDocuments({ userId, signed: false });

        // 5. Notifications
        const unreadNotifications = await Notification.countDocuments({ userId, isRead: false });

        return res.status(200).json({
            success: true,
            dashboard: {
                todayStatus: {
                    checkedIn: !!todayAttendance,
                    checkInTime: todayAttendance ? todayAttendance.checkIn : null,
                    checkOutTime: todayAttendance ? todayAttendance.checkOut : null,
                    status: todayAttendance ? todayAttendance.status : null
                },
                attendanceHistory: {
                    present: presentDays,
                    absent: absentDays,
                    halfDay: halfDays,
                    total: totalAttendanceLogs.length
                },
                leaves: {
                    applied: leavesApplied,
                    pending: pendingLeaves,
                    approved: approvedLeaves,
                    rejected: rejectedLeaves
                },
                investments: {
                    totalInvestedAmount,
                    count: myInvestments.length
                },
                documents: {
                    total: totalAssignedDocs,
                    signed: signedDocs,
                    pendingSignature: unsignedDocs
                },
                notifications: {
                    unread: unreadNotifications
                }
            }
        });
    } catch (error) {
        console.error("Error generating personal dashboard summary:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Analytics and Distribution (Groupings and Aggregations)
const getAnalytics = async (req, res) => {
    try {
        // 1. Employee Distribution by Department
        const departmentDistribution = await Employee.aggregate([
            { $group: { _id: "$department", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // 2. Employee Distribution by Designation
        const designationDistribution = await Employee.aggregate([
            { $group: { _id: "$designation", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // 3. Leave Distribution by Type
        const leaveTypeDistribution = await Leave.aggregate([
            { $group: { _id: "$leaveType", count: { $sum: 1 } } }
        ]);

        // 4. Investment Breakdown by Category
        const investmentBreakdown = await Investment.aggregate([
            {
                $group: {
                    _id: "$investmentType",
                    totalAmount: { $sum: "$amount" },
                    avgAmount: { $avg: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        // 5. Global Attendance Rates
        const totalAttendance = await Attendance.countDocuments();
        const presentCount = await Attendance.countDocuments({ status: "present" });
        const globalAttendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 100;

        return res.status(200).json({
            success: true,
            analytics: {
                departments: departmentDistribution,
                designations: designationDistribution,
                leaves: leaveTypeDistribution,
                investments: investmentBreakdown,
                attendance: {
                    totalRecords: totalAttendance,
                    presentRecords: presentCount,
                    attendanceRatePercentage: Math.round(globalAttendanceRate * 100) / 100
                }
            }
        });
    } catch (error) {
        console.error("Error generating system analytics:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    getAdminDashboard,
    getUserDashboard,
    getAnalytics
};
