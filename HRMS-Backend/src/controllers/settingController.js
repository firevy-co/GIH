const Setting = require("../models/Setting");

// Get system settings (Self-initializing if none exist)
const getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();

        // If no settings document exists yet, auto-create a default one
        if (!settings) {
            settings = await Setting.create({
                companyName: "GIH Portal",
                companyEmail: "info@company.com",
                companyPhone: "+1 (234) 567-8900",
                websiteLogo: "",
                maintenanceMode: false
            });
        }

        return res.status(200).json({
            success: true,
            settings
        });
    } catch (error) {
        console.error("Error fetching system settings:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update system settings (Admin only action)
const updateSettings = async (req, res) => {
    try {
        const { companyName, companyEmail, companyPhone, websiteLogo, maintenanceMode } = req.body;

        let settings = await Setting.findOne();

        // Create default settings container first if not present
        if (!settings) {
            settings = new Setting();
        }

        if (companyName !== undefined) settings.companyName = companyName;
        if (companyEmail !== undefined) settings.companyEmail = companyEmail;
        if (companyPhone !== undefined) settings.companyPhone = companyPhone;
        if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;

        // If a new website logo file was physically uploaded via multer
        if (req.file) {
            settings.websiteLogo = `/uploads/${req.file.filename}`;
        } else if (websiteLogo !== undefined) {
            // Or if they supplied a static logo url string
            settings.websiteLogo = websiteLogo;
        }

        await settings.save();

        return res.status(200).json({
            success: true,
            message: "System settings updated successfully",
            settings
        });
    } catch (error) {
        console.error("Error updating system settings:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
