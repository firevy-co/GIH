const express = require("express");
const {
    uploadDocument,
    getAllDocuments,
    getDocumentById,
    deleteDocument,
    signDocument,
    updateDocument
} = require("../controllers/documentController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

// Upload document (Authenticated users, incorporates file upload middleware)
router.post("/upload", protect, upload.single("file"), uploadDocument);

// Get list of documents (Authenticated users, filtered by owner/uploader)
router.get("/", protect, getAllDocuments);

// Get single document details
router.get("/:id", protect, getDocumentById);

// Delete document
router.delete("/delete/:id", protect, deleteDocument);

// Sign document
router.post("/sign/:id", protect, signDocument);

// Update document details or status (signed, userId, title, documentType)
router.put("/update/:id", protect, updateDocument);

module.exports = router;
