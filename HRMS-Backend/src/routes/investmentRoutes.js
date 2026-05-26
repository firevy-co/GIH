const express = require("express");
const {
    createInvestment,
    getInvestments,
    getInvestmentById,
    updateInvestment,
    deleteInvestment
} = require("../controllers/investmentController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

// Create investment (Accessible to authenticated users)
router.post("/create", protect, createInvestment);

// Get list of investments (Accessible to authenticated users, filtered by owner)
router.get("/", protect, getInvestments);

// Get single investment details
router.get("/:id", protect, getInvestmentById);

// Update investment (Restricted to owner or Admin)
router.put("/update/:id", protect, updateInvestment);

// Delete investment (Restricted to owner or Admin)
router.delete("/delete/:id", protect, deleteInvestment);

module.exports = router;
