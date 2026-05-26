const express = require("express");
const { 
    createEmployee, 
    getEmployees, 
    getEmployeeById, 
    updateEmployee, 
    deleteEmployee 
} = require("../controllers/employeeController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const router = express.Router();

// Get all employees and single employee (Accessible to authenticated users)
router.get("/", protect, getEmployees);
router.get("/:id", protect, getEmployeeById);

// Admin only actions for managing employees
router.post("/", protect, authorize("admin"), createEmployee);
router.put("/:id", protect, authorize("admin"), updateEmployee);
router.delete("/:id", protect, authorize("admin"), deleteEmployee);

module.exports = router;
