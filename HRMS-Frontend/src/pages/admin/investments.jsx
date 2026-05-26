import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Filter, Eye, Edit2, XCircle, FileText, User, CreditCard, TrendingUp, X, Loader2 } from "lucide-react";
import { fetchInvestments, deleteInvestment, updateInvestment } from "../../redux/slices/investmentSlice";

export const AdminInvestments = () => {
    const dispatch = useDispatch();
    const { investments, loading } = useSelector((state) => state.investments);

    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("");
    const [selectedInvestment, setSelectedInvestment] = useState(null);

    useEffect(() => {
        dispatch(fetchInvestments());
    }, [dispatch]);

    // Get unique investment types for filter dropdown
    const investmentTypes = [...new Set(investments.map(inv => inv.investmentType).filter(Boolean))];

    // Dynamic filtering
    const filteredInvestments = investments.filter(inv => {
        const investorName = inv.userId?.name || "";
        const investorEmail = inv.userId?.email || "";
        const matchesSearch = investorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              investorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (inv._id || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "All" || inv.investmentType === typeFilter;
        const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
        const matchesDate = dateFilter === "" || (inv.startDate && inv.startDate.substring(0, 10) === dateFilter);
        
        return matchesSearch && matchesType && matchesStatus && matchesDate;
    });

    const handleViewDetails = (inv) => {
        setSelectedInvestment(inv);
    };

    const handleCancelInvestment = (inv) => {
        if (window.confirm("Are you sure you want to cancel this investment?")) {
            dispatch(updateInvestment({ id: inv._id, data: { status: "cancelled" } }));
        }
    };

    const handleDeleteInvestment = (inv) => {
        if (window.confirm("Are you sure you want to delete this investment?")) {
            dispatch(deleteInvestment(inv._id));
        }
    };

    const formatStatus = (status) => {
        if (!status) return "Active";
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Investment Management</h1>
                    <p className="text-sm text-gray-400 mt-1">Track client investments, view payment records, and manage portfolios.</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search */}
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search Investor Name or ID..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                </div>

                {/* Dropdown Filters */}
                <div className="flex flex-wrap w-full md:w-auto gap-4">
                    <div className="relative w-full sm:w-auto">
                        <input 
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                        />
                    </div>
                    
                    <select 
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full sm:w-auto bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                        <option value="All">All Types</option>
                        {investmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-gray-500 hidden sm:block" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Investments Table */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-500 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Investor</th>
                                <th className="px-6 py-4">Investment Type</th>
                                <th className="px-6 py-4 font-mono text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Start Date</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-500">
                                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                            <span className="text-sm">Loading investments...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInvestments.length > 0 ? filteredInvestments.map((inv) => (
                                <tr key={inv._id} className="hover:bg-gray-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-200 group-hover:text-orange-400 transition-colors">{inv.userId?.name || "—"}</span>
                                            <span className="text-xs text-gray-500 mt-0.5">{inv.userId?.email || "—"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-300">{inv.investmentType || "—"}</td>
                                    <td className="px-6 py-4 font-mono text-green-400 font-semibold text-right">${(inv.amount || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-mono text-center text-gray-400">{formatDate(inv.startDate)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                            inv.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                            inv.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            inv.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        }`}>
                                            {formatStatus(inv.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleViewDetails(inv)} className="p-1.5 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors cursor-pointer" title="View Details">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleCancelInvestment(inv)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Cancel Investment">
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No investments found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Investment Details Modal */}
            {selectedInvestment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-orange-500" /> Investment Details
                            </h2>
                            <button onClick={() => setSelectedInvestment(null)} className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-sm text-gray-300">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Column 1: Investor & Investment Overview */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800 text-center">
                                        <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xl font-bold text-orange-400 mb-3 mx-auto">
                                            {(selectedInvestment.userId?.name || "?").charAt(0)}
                                        </div>
                                        <h3 className="text-lg font-bold text-white">{selectedInvestment.userId?.name || "—"}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{selectedInvestment.userId?.email || "—"}</p>
                                    </div>

                                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800 space-y-4">
                                        <h4 className="text-sm font-semibold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-orange-500" /> Investment Overview
                                        </h4>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">Type</span>
                                            <span className="text-sm font-medium text-gray-200">{selectedInvestment.investmentType || "—"}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">Total Amount</span>
                                            <span className="text-lg font-bold text-green-400">${(selectedInvestment.amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">Start Date</span>
                                            <span className="text-sm font-medium text-gray-200">{formatDate(selectedInvestment.startDate)}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">Maturity Date</span>
                                            <span className="text-sm font-medium text-gray-200">{formatDate(selectedInvestment.maturityDate)}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">Status</span>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-max ${
                                                selectedInvestment.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                                selectedInvestment.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                            }`}>
                                                {formatStatus(selectedInvestment.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Column 2: Dates & Info */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
                                        <h4 className="text-sm font-semibold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-green-500" /> Investment Timeline
                                        </h4>
                                        <div className="mt-4 space-y-3">
                                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-800">
                                                <span className="text-xs text-gray-500">Created</span>
                                                <span className="text-sm text-gray-200">{formatDate(selectedInvestment.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-800">
                                                <span className="text-xs text-gray-500">Start Date</span>
                                                <span className="text-sm text-gray-200">{formatDate(selectedInvestment.startDate)}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-800">
                                                <span className="text-xs text-gray-500">Maturity Date</span>
                                                <span className="text-sm text-gray-200">{formatDate(selectedInvestment.maturityDate)}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-800">
                                                <span className="text-xs text-gray-500">Last Updated</span>
                                                <span className="text-sm text-gray-200">{formatDate(selectedInvestment.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-800 flex justify-end gap-3 shrink-0 bg-[#111111]">
                            <button onClick={() => setSelectedInvestment(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};