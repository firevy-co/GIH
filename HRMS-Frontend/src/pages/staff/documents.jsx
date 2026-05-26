import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, UploadCloud, Eye, Download, Trash2, X, FileText, CheckCircle2, XCircle, Clock, Filter, User, Maximize2, File, Loader2, Check } from "lucide-react";
import { fetchDocuments, uploadDocument, deleteDocument, signDocument } from "../../redux/slices/documentSlice";
import { fetchAllUsers } from "../../redux/slices/userSlice";

export const StaffDocuments = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { documents, loading } = useSelector((state) => state.documents);
    const { users, loading: usersLoading } = useSelector((state) => state.users);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterDate, setFilterDate] = useState("");
    
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);

    // Form State for Upload
    const [selectedUserId, setSelectedUserId] = useState("");
    const [title, setTitle] = useState("");
    const [documentType, setDocumentType] = useState("Agreement");
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        dispatch(fetchDocuments());
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // Filtering Logic
    const filteredDocs = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = (doc.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (doc.userId?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
            
            const docType = doc.documentType || "Agreement";
            const matchesType = filterType === "All" || docType.toLowerCase() === filterType.toLowerCase();
            
            const docStatus = doc.signed ? "Signed" : "Pending";
            const matchesStatus = filterStatus === "All" || 
                                 (filterStatus === "Signed" && doc.signed) || 
                                 (filterStatus === "Pending" && !doc.signed);
            
            const docDate = doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : "";
            const matchesDate = filterDate === "" || docDate === filterDate;
            
            return matchesSearch && matchesType && matchesStatus && matchesDate;
        });
    }, [documents, searchQuery, filterType, filterStatus, filterDate]);

    const getStatusBadge = (signed) => {
        if (signed) {
            return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle2 className="w-3 h-3" /> Signed</span>;
        } else {
            return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" /> Pending Signature</span>;
        }
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!title || !selectedFile) {
            alert("Please provide a title and select a file.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("documentType", documentType);
        formData.append("file", selectedFile);
        if (selectedUserId) {
            formData.append("userId", selectedUserId);
        }

        dispatch(uploadDocument(formData)).unwrap().then(() => {
            alert("Document uploaded and assigned successfully!");
            setIsUploadModalOpen(false);
            setTitle("");
            setSelectedUserId("");
            setSelectedFile(null);
            dispatch(fetchDocuments());
        }).catch((err) => {
            alert("Error uploading document: " + err);
        });
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            dispatch(deleteDocument(id)).unwrap().then(() => {
                alert("Document deleted successfully!");
            }).catch((err) => {
                alert("Error deleting document: " + err);
            });
        }
    };

    const handleSign = (id) => {
        if (window.confirm("Are you sure you want to sign this document?")) {
            dispatch(signDocument(id)).unwrap().then(() => {
                alert("Document signed successfully!");
                if (previewDoc && previewDoc._id === id) {
                    setPreviewDoc(prev => ({ ...prev, signed: true }));
                }
                dispatch(fetchDocuments());
            }).catch((err) => {
                alert("Error signing document: " + err);
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Document Management</h1>
                    <p className="text-sm text-gray-400 mt-1">Upload files, associate them with users, and track document statuses.</p>
                </div>
                <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
                >
                    <UploadCloud className="w-4 h-4" /> Upload Document
                </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
                
                {/* Advanced Filters Bar */}
                <div className="p-5 border-b border-gray-800 bg-[#111111] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                    
                    {/* Search by User/Name */}
                    <div className="lg:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Search by document name or user..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Filter by Status */}
                    <div>
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Signed">Signed</option>
                            <option value="Pending">Pending Signature</option>
                        </select>
                    </div>

                    {/* Filter by Type */}
                    <div>
                        <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="All">All Types</option>
                            <option value="Agreement">Agreement</option>
                            <option value="KYC">KYC</option>
                            <option value="Report">Report</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Filter by Date */}
                    <div>
                        <input 
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Documents Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-500 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Document Details</th>
                                <th className="px-6 py-4">Assigned User</th>
                                <th className="px-6 py-4">Upload Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                                        <span className="text-sm text-gray-500 block mt-2">Loading documents...</span>
                                    </td>
                                </tr>
                            ) : filteredDocs.length > 0 ? filteredDocs.map((doc) => {
                                const assignedUser = doc.userId ? doc.userId.name : "Broadcast";
                                const isOwnDocument = doc.userId?._id === user?._id;
                                return (
                                    <tr key={doc._id} className="hover:bg-[#1a1a1a] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-gray-700 flex items-center justify-center text-blue-500 shrink-0">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{doc.title}</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-gray-500 uppercase font-semibold">{doc.documentType}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-300 font-medium">
                                                <User className="w-4 h-4 text-gray-500" /> {assignedUser}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-400">
                                            {formatDate(doc.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(doc.signed)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                {isOwnDocument && !doc.signed && (
                                                    <button 
                                                        onClick={() => handleSign(doc._id)}
                                                        className="p-2 bg-gray-800 hover:bg-green-500 hover:text-white text-gray-400 rounded-lg transition-colors border border-gray-700 hover:border-green-500 cursor-pointer" title="Sign Document">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => setPreviewDoc(doc)}
                                                    className="p-2 bg-gray-800 hover:bg-blue-500 hover:text-white text-gray-400 rounded-lg transition-colors border border-gray-700 hover:border-blue-500 cursor-pointer" title="View Document">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {doc.documentUrl && (
                                                    <a 
                                                        href={`http://localhost:5000${doc.documentUrl}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="p-2 bg-gray-800 hover:bg-green-500 hover:text-white text-gray-400 rounded-lg transition-colors border border-gray-700 hover:border-green-500 cursor-pointer" title="Download">
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {doc.uploadedBy?._id === user?._id && (
                                                    <button 
                                                        onClick={() => handleDelete(doc._id)}
                                                        className="p-2 bg-gray-800 hover:bg-red-500 hover:text-white text-gray-400 rounded-lg transition-colors border border-gray-700 hover:border-red-500 cursor-pointer" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-lg font-semibold text-gray-400">No documents found</p>
                                            <p className="text-sm mt-1">Try adjusting your filters or upload a new document.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upload Document Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-[#111111]">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <UploadCloud className="w-5 h-5 text-blue-500" /> Upload New Document
                            </h2>
                            <button 
                                onClick={() => setIsUploadModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 p-1.5 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Assign User</label>
                                <select 
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="">Broadcast (All Users)</option>
                                    {users.map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Document Title</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Q3_Financial_Agreement.pdf"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Document Type</label>
                                <select 
                                    required
                                    value={documentType}
                                    onChange={(e) => setDocumentType(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="Agreement">Agreement</option>
                                    <option value="KYC">KYC</option>
                                    <option value="Report">Report</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* File Upload input */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select File</label>
                                <input 
                                    type="file"
                                    required
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 file:cursor-pointer"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-blue-500 hover:bg-blue-400 text-white px-4 py-3 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                                >
                                    Upload & Assign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Document Preview Modal (Full Screen) */}
            {previewDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <File className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{previewDoc.title}</h3>
                                <p className="text-xs text-gray-400">Assigned to: {previewDoc.userId ? previewDoc.userId.name : "Broadcast"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {previewDoc.userId?._id === user?._id && !previewDoc.signed && (
                                <button 
                                    onClick={() => handleSign(previewDoc._id)}
                                    className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors backdrop-blur-sm flex items-center gap-2 cursor-pointer"
                                >
                                    Sign Document
                                </button>
                            )}
                            {previewDoc.documentUrl && (
                                <a 
                                    href={`http://localhost:5000${previewDoc.documentUrl}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="bg-gray-800/80 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors backdrop-blur-sm border border-gray-600 flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download
                                </a>
                            )}
                            <button 
                                onClick={() => setPreviewDoc(null)}
                                className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-lg transition-colors backdrop-blur-sm border border-red-500/50 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Document Preview Area */}
                    <div className="w-11/12 max-w-5xl h-[80vh] bg-[#1a1a1a] rounded-lg shadow-2xl mt-12 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex justify-center items-center gap-4 text-gray-400 shrink-0">
                            <span className="text-xs font-semibold">Preview Mode</span>
                        </div>
                        <div className="flex-1 bg-gray-800 overflow-y-auto p-8 flex justify-center items-start">
                            <div className="w-full max-w-3xl aspect-[1/1.4] bg-[#1a1a1a] shadow-md border border-gray-700 p-12 flex flex-col justify-between">
                                <div>
                                    <div className="border-b-2 border-gray-800 pb-6 mb-8 flex justify-between items-center">
                                        <h1 className="text-3xl font-black text-white tracking-tight">HRMS GLOBAL</h1>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-400 uppercase">{previewDoc.documentType}</p>
                                            <p className="text-xs text-gray-500">{formatDate(previewDoc.createdAt)}</p>
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-200 mb-6">{previewDoc.title}</h2>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        This document serves as an official record of the agreement or submission within the HRMS Portal. All terms, details, and signatures listed herein represent a secure digital filing. Please review document details carefully.
                                    </p>
                                </div>
                                <div className="pt-8 border-t border-gray-800 flex justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-8">Uploaded By</p>
                                        <div className="w-40 border-b border-gray-800 mb-2"></div>
                                        <p className="text-xs text-gray-400 font-semibold">{previewDoc.uploadedBy ? previewDoc.uploadedBy.name : "System"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-8">Client / Assignee Signature</p>
                                        <div className="w-40 border-b border-gray-800 mb-2 flex items-center min-h-[20px]">
                                            {previewDoc.signed ? (
                                                <span className="text-xs text-green-400 font-mono font-bold tracking-wider">✓ SIGNED DIGITAL</span>
                                            ) : (
                                                <span className="text-xs text-red-400 font-mono font-bold tracking-wider">✗ UNSIGNED</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 font-semibold">{previewDoc.userId ? previewDoc.userId.name : "Broadcast"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
