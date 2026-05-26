const Investment = require("../models/Investment");

// Create an Investment
const createInvestment = async (req, res) => {
    try {
        const { userId, amount, investmentType, startDate, maturityDate, status } = req.body;

        if (!amount || !investmentType || !startDate || !maturityDate) {
            return res.status(400).json({
                success: false,
                message: "Amount, investmentType, startDate, and maturityDate are required"
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a positive number"
            });
        }

        const start = new Date(startDate);
        const maturity = new Date(maturityDate);

        if (start >= maturity) {
            return res.status(400).json({
                success: false,
                message: "startDate must be before maturityDate"
            });
        }

        const investment = await Investment.create({
            userId: userId || req.user._id, // Defaults to the logged-in user if not specified
            amount,
            investmentType,
            startDate: start,
            maturityDate: maturity,
            status: status || "active"
        });

        return res.status(201).json({
            success: true,
            message: "Investment record created successfully",
            investment
        });
    } catch (error) {
        console.error("Error creating investment:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all investments (with optional filters and user-role restrictions)
const getInvestments = async (req, res) => {
    try {
        const { userId, status, investmentType } = req.query;
        const query = {};

        // Security Policy: Standard users should only see their own investments
        if (req.user.role !== "admin") {
            query.userId = req.user._id;
        } else {
            // Admins can query by any userId
            if (userId) query.userId = userId;
        }

        if (status) query.status = status;
        if (investmentType) query.investmentType = investmentType;

        const investments = await Investment.find(query)
            .populate("userId", "name email department designation")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: investments.length,
            investments
        });
    } catch (error) {
        console.error("Error fetching investments:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get single investment details by ID
const getInvestmentById = async (req, res) => {
    try {
        const investment = await Investment.findById(req.params.id)
            .populate("userId", "name email department designation");

        if (!investment) {
            return res.status(404).json({
                success: false,
                message: "Investment record not found"
            });
        }

        // Security Check: Standard users can only view their own investments
        if (req.user.role !== "admin" && investment.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this investment record"
            });
        }

        return res.status(200).json({
            success: true,
            investment
        });
    } catch (error) {
        console.error("Error fetching investment details:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update Investment
const updateInvestment = async (req, res) => {
    try {
        const { amount, investmentType, startDate, maturityDate, status } = req.body;
        
        let investment = await Investment.findById(req.params.id);
        if (!investment) {
            return res.status(404).json({
                success: false,
                message: "Investment record not found"
            });
        }

        // Security Check: Standard users can only update their own investments
        if (req.user.role !== "admin" && investment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this investment record"
            });
        }

        // Validation for updated dates if they are supplied
        const start = startDate ? new Date(startDate) : investment.startDate;
        const maturity = maturityDate ? new Date(maturityDate) : investment.maturityDate;

        if (startDate || maturityDate) {
            if (start >= maturity) {
                return res.status(400).json({
                    success: false,
                    message: "startDate must be before maturityDate"
                });
            }
        }

        if (amount && amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a positive number"
            });
        }

        investment = await Investment.findByIdAndUpdate(
            req.params.id,
            { amount, investmentType, startDate: start, maturityDate: maturity, status },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Investment record updated successfully",
            investment
        });
    } catch (error) {
        console.error("Error updating investment:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete Investment
const deleteInvestment = async (req, res) => {
    try {
        const investment = await Investment.findById(req.params.id);

        if (!investment) {
            return res.status(404).json({
                success: false,
                message: "Investment record not found"
            });
        }

        // Security Check: Standard users can only delete their own investments
        if (req.user.role !== "admin" && investment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this investment record"
            });
        }

        await Investment.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Investment record deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting investment:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    createInvestment,
    getInvestments,
    getInvestmentById,
    updateInvestment,
    deleteInvestment
};
