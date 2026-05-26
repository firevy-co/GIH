import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, UploadCloud, Eye, Download, Trash2, X, FileText, CheckCircle2, XCircle, File, AlertCircle, Maximize2, Clock, Loader2 } from "lucide-react";
import { fetchDocuments, uploadDocument, deleteDocument, updateDocumentAction } from "../../redux/slices/documentSlice";
import { fetchAllUsers } from "../../redux/slices/userSlice";

export const AdminDocuments = () => {
    const dispatch = useDispatch();
    const { documents, loading } = useSelector((state) => state.documents);
    const { users } = useSelector((state) => state.users);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);

    // Upload form state
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadType, setUploadType] = useState("Agreement");
    const [uploadUserId, setUploadUserId] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        dispatch(fetchDocuments());
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // Get unique document types for filter
    const docTypes = [...new Set(documents.map(d => d.documentType).filter(Boolean))];

    // Filter Logic
    const filteredDocs = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = (doc.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (doc.userId?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === "All" || doc.documentType === filterType;
            return matchesSearch && matchesType;
        });
    }, [documents, searchQuery, filterType]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const handleStatusChange = (docId, signedValue) => {
        dispatch(updateDocumentAction({ id: docId, signed: signedValue === "true" }));
    };

    const handleDeleteDocument = (id) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            dispatch(deleteDocument(id));
        }
    };

    const handleUpload = () => {
        if (!uploadTitle || !uploadFile) {
            alert("Please provide a title and select a file.");
            return;
        }
        const formData = new FormData();
        formData.append("title", uploadTitle);
        formData.append("documentType", uploadType);
        formData.append("file", uploadFile);
        if (uploadUserId) {
            formData.append("userId", uploadUserId);
        }
        
        dispatch(uploadDocument(formData));
        setIsUploadModalOpen(false);
        setUploadTitle("");
        setUploadType("Agreement");
        setUploadUserId("");
        setUploadFile(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Document Management</h1>
                    <p className="text-sm text-gray-400 mt-1">Upload, preview, and track signed status for KYC files and agreements.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-orange-500/20 flex items-center gap-2"
                >
                    <UploadCloud className="w-4 h-4" />
                    Upload Document
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Document Name or User..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full md:w-48 bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                        <option value="All">All Types</option>
                        {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* Documents Table */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-500 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Document Name</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Uploaded By</th>
                                <th className="px-6 py-4 text-center">Signed Status</th>
                                <th className="px-6 py-4 text-center">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-500">
                                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                            <span className="text-sm">Loading documents...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                                <tr key={doc._id} className="hover:bg-gray-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-200 group-hover:text-orange-400 transition-colors">{doc.title || "Untitled"}</span>
                                                <span className="text-[10px] text-gray-500 mt-0.5">{doc.documentType || "—"}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-200">{doc.userId?.name || "—"}</td>
                                    <td className="px-6 py-4 text-gray-300">{doc.uploadedBy?.name || "—"}</td>
                                    <td className="px-6 py-4 text-center">
                                        <select
                                            value={doc.signed ? "true" : "false"}
                                            onChange={(e) => handleStatusChange(doc._id, e.target.value)}
                                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#111] border cursor-pointer focus:outline-none transition-colors ${
                                                doc.signed 
                                                    ? 'text-green-400 border-green-500/20 bg-green-500/5 hover:bg-green-500/10' 
                                                    : 'text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10'
                                            }`}
                                        >
                                            <option value="false" className="bg-[#1a1a1a] text-red-400">Unsigned</option>
                                            <option value="true" className="bg-[#1a1a1a] text-green-400">Signed</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-center text-gray-400">{formatDate(doc.createdAt)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => setPreviewDoc(doc)} className="p-1.5 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors cursor-pointer" title="Preview">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {doc.documentUrl && (
                                                <a href={`http://localhost:5000${doc.documentUrl}`} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors cursor-pointer" title="Download">
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            )}
                                            <button onClick={() => handleDeleteDocument(doc._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No documents found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <UploadCloud className="w-5 h-5 text-orange-500" /> Upload Document
                            </h2>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Document Title</label>
                                <input type="text" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none" placeholder="Enter document title..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Document Type</label>
                                    <select value={uploadType} onChange={e => setUploadType(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none">
                                        <option value="Agreement">Agreement (PDF)</option>
                                        <option value="KYC">KYC File (PDF/Image)</option>
                                        <option value="Report">Financial Report</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Assign User</label>
                                    <select value={uploadUserId} onChange={e => setUploadUserId(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2.5 text-white focus:border-orange-500 focus:outline-none">
                                        <option value="">Default (Self)</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Drag & Drop Area */}
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center bg-[#1a1a1a] hover:border-orange-500/50 hover:bg-[#1a1a1a]/80 transition-colors cursor-pointer group"
                            >
                                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.png,.jpeg" onChange={e => setUploadFile(e.target.files[0])} />
                                <div className="w-12 h-12 bg-[#1a1a1a] border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                </div>
                                {uploadFile ? (
                                    <h4 className="text-sm font-semibold text-orange-400 mb-1">{uploadFile.name}</h4>
                                ) : (
                                    <h4 className="text-sm font-semibold text-white mb-1">Click to upload or drag and drop</h4>
                                )}
                                <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</p>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-800 flex justify-end gap-3 shrink-0 bg-[#111111]">
                            <button onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">Cancel</button>
                            <button onClick={handleUpload} className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20">Upload File</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Viewer */}
            {previewDoc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm transition-opacity">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">

                        {/* Viewer Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0 bg-[#111111] rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white leading-tight">{previewDoc.title || "Document"}</h3>
                                    <p className="text-[10px] text-gray-500">Assigned to: {previewDoc.userId?.name || "—"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {previewDoc.documentUrl && (
                                    <a href={`http://localhost:5000${previewDoc.documentUrl}`} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded-md transition-colors" title="Download">
                                        <Download className="w-4 h-4" />
                                    </a>
                                )}
                                <div className="w-px h-5 bg-gray-700 mx-1"></div>
                                <button onClick={() => setPreviewDoc(null)} className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-md transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* PDF Viewer Body */}
                        <div className="flex-1 bg-[#111111] flex items-center justify-center relative overflow-hidden p-6">
                            {previewDoc.documentUrl ? (
                                <iframe 
                                    src={`http://localhost:5000${previewDoc.documentUrl}`} 
                                    className="w-full h-full rounded-lg border border-gray-800"
                                    title="Document Preview"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-gray-500/50">
                                    <AlertCircle className="w-16 h-16" />
                                    <p className="text-sm font-semibold tracking-widest uppercase">No Preview Available</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};