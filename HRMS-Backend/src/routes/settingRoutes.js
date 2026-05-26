const express = require("express");
const { getSettings, updateSettings } = require("../controllers/settingController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

// Retrieve global system settings (Accessible to authenticated users)
router.get("/", protect, getSettings);

// Update global system settings (Restricted to Admin, supports file upload for company logo)
router.put("/update", protect, authorize("admin"), upload.single("logo"), updateSettings);

module.exports = router;
