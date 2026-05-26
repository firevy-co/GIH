const Document = require("../models/Document");
const path = require("path");

// Upload Document
const uploadDocument = async (req, res) => {
    try {
        const { userId, title, documentType, documentUrl } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Document title is required"
            });
        }

        let finalUrl = documentUrl;
        let finalType = documentType;

        // If file is physically uploaded via multer
        if (req.file) {
            finalUrl = `/uploads/${req.file.filename}`;
            if (!finalType) {
                // Infer type from extension (e.g. 'pdf')
                finalType = path.extname(req.file.originalname).substring(1);
            }
        }

        if (!finalUrl) {
            return res.status(400).json({
                success: false,
                message: "Please upload a file or provide a documentUrl"
            });
        }

        const document = await Document.create({
            userId: userId || req.user._id, // Assign to specified user or default to self
            title,
            documentUrl: finalUrl,
            documentType: finalType || "unknown",
            uploadedBy: req.user._id, // User from auth middleware
            signed: false
        });

        const populatedDoc = await Document.findById(document._id)
            .populate("userId", "name email department designation")
            .populate("uploadedBy", "name email role");

        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            document: populatedDoc
        });
    } catch (error) {
        console.error("Error uploading document:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all documents
const getAllDocuments = async (req, res) => {
    try {
        const { userId, signed } = req.query;
        const query = {};

        // Security Policy: Standard users should only see documents belonging to them or uploaded by them
        if (req.user.role !== "admin") {
            query.$or = [
                { userId: req.user._id },
                { uploadedBy: req.user._id }
            ];
        } else {
            // Admins can query by userId
            if (userId) query.userId = userId;
        }

        if (signed !== undefined) {
            query.signed = signed === "true";
        }

        const documents = await Document.find(query)
            .populate("userId", "name email department designation")
            .populate("uploadedBy", "name email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: documents.length,
            documents
        });
    } catch (error) {
        console.error("Error fetching documents:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get single document details
const getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate("userId", "name email department designation")
            .populate("uploadedBy", "name email role");

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Security check: Only admins or owners (target user or uploader) can view it
        if (
            req.user.role !== "admin" &&
            document.userId.toString() !== req.user._id.toString() &&
            document.uploadedBy.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this document"
            });
        }

        return res.status(200).json({
            success: true,
            document
        });
    } catch (error) {
        console.error("Error fetching document:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete Document
const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Security check: Only admins or the uploader can delete it
        if (req.user.role !== "admin" && document.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this document"
            });
        }

        await Document.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Document deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting document:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Sign Document
const signDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Security check: Only the target user (whom the document belongs to) can sign it
        if (document.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the designated user can sign this document"
            });
        }

        if (document.signed) {
            return res.status(400).json({
                success: false,
                message: "Document is already signed"
            });
        }

        document.signed = true;
        await document.save();

        return res.status(200).json({
            success: true,
            message: "Document signed successfully",
            document
        });
    } catch (error) {
        console.error("Error signing document:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update Document (Admin or Uploader)
const updateDocument = async (req, res) => {
    try {
        const { signed, userId, title, documentType } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Security check: Only admins or the uploader can update it
        if (req.user.role !== "admin" && document.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this document"
            });
        }

        if (signed !== undefined) document.signed = signed;
        if (userId !== undefined) document.userId = userId;
        if (title !== undefined) document.title = title;
        if (documentType !== undefined) document.documentType = documentType;

        await document.save();

        // Populate to match response format
        const updatedDoc = await Document.findById(document._id)
            .populate("userId", "name email department designation")
            .populate("uploadedBy", "name email role");

        return res.status(200).json({
            success: true,
            message: "Document updated successfully",
            document: updatedDoc
        });
    } catch (error) {
        console.error("Error updating document:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    uploadDocument,
    getAllDocuments,
    getDocumentById,
    deleteDocument,
    signDocument,
    updateDocument
};
