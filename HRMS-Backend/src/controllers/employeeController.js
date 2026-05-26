const Employee = require("../models/Employee");

// Create new Employee
const createEmployee = async (req, res) => {
    try {
        const { name, email, phone, department, designation, status } = req.body;

        if (!name || !email || !department || !designation) {
            return res.status(400).json({
                success: false,
                message: "Name, email, department, and designation are required"
            });
        }

        const employeeExists = await Employee.findOne({ email });
        if (employeeExists) {
            return res.status(400).json({
                success: false,
                message: "Employee with this email already exists"
            });
        }

        const employee = await Employee.create({
            name,
            email,
            phone,
            department,
            designation,
            status
        });

        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            employee
        });
    } catch (error) {
        console.error("Error creating employee:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all Employees
const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        return res.status(200).json({
            success: true,
            count: employees.length,
            employees
        });
    } catch (error) {
        console.error("Error fetching employees:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get single Employee by ID
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }
        return res.status(200).json({
            success: true,
            employee
        });
    } catch (error) {
        console.error("Error fetching employee:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update Employee
const updateEmployee = async (req, res) => {
    try {
        const { name, email, phone, department, designation, status } = req.body;
        
        let employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, department, designation, status },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            employee
        });
    } catch (error) {
        console.error("Error updating employee:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        await Employee.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting employee:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};
