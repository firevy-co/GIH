import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Filter, Check, X, Eye, Clock, CheckCircle2, XCircle, Calendar, CalendarOff, User, Loader2 } from "lucide-react";
import { fetchLeaves, approveLeave, rejectLeave } from "../../redux/slices/leaveSlice";

export const AdminLeaves = () => {
    const dispatch = useDispatch();
    const { leaves, loading } = useSelector((state) => state.leaves);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedLeave, setSelectedLeave] = useState(null);

    useEffect(() => {
        dispatch(fetchLeaves());
    }, [dispatch]);

    // Compute analytics from real data
    const pendingCount = useMemo(() => leaves.filter(l => l.status === "pending").length, [leaves]);
    const approvedCount = useMemo(() => leaves.filter(l => l.status === "approved").length, [leaves]);
    const rejectedCount = useMemo(() => leaves.filter(l => l.status === "rejected").length, [leaves]);

    // Filtering logic
    const filteredLeaves = useMemo(() => {
        return leaves.filter(leave => {
            const empName = leave.employeeId?.name || "";
            const empEmail = leave.employeeId?.email || "";
            const matchesSearch = empName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  empEmail.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || leave.status === statusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [leaves, searchQuery, statusFilter]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatStatus = (status) => {
        if (!status) return "Pending";
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const calcDays = (from, to) => {
        if (!from || !to) return 1;
        const diff = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 0 ? diff : 1;
    };

    const handleViewReason = (leave) => {
        setSelectedLeave(leave);
    };

    const handleApprove = (id) => {
        dispatch(approveLeave(id));
        setSelectedLeave(null);
    };

    const handleReject = (id) => {
        dispatch(rejectLeave(id));
        setSelectedLeave(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Leave Approvals</h1>
                    <p className="text-sm text-gray-400 mt-1">Review, approve, or reject employee leave requests and monitor balances.</p>
                </div>
            </div>

            {/* Leave Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-amber-500/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Pending Requests</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{pendingCount}</h3>
                    </div>
                </div>
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-green-500/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Approved Leaves</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{approvedCount}</h3>
                    </div>
                </div>
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-orange-500/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                        <CalendarOff className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Rejected Leaves</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{rejectedCount}</h3>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search Employee Name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-gray-500 hidden md:block" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full md:w-48 bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Leaves Table */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-500 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Leave Type</th>
                                <th className="px-6 py-4">From Date</th>
                                <th className="px-6 py-4">To Date</th>
                                <th className="px-6 py-4 text-center">Duration</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-500">
                                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                            <span className="text-sm">Loading leave requests...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLeaves.length > 0 ? filteredLeaves.map((leave) => {
                                const days = calcDays(leave.fromDate, leave.toDate);
                                return (
                                    <tr key={leave._id} className="hover:bg-gray-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-200">{leave.employeeId?.name || "—"}</span>
                                                <span className="text-xs text-gray-500 mt-0.5">{leave.employeeId?.email || "—"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-300">{formatStatus(leave.leaveType)}</td>
                                        <td className="px-6 py-4 font-mono text-gray-400">{formatDate(leave.fromDate)}</td>
                                        <td className="px-6 py-4 font-mono text-gray-400">{formatDate(leave.toDate)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2.5 py-1 bg-gray-800 rounded-md text-xs font-semibold text-gray-300">
                                                {days} Day{days > 1 ? 's' : ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                leave.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                                leave.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                                {formatStatus(leave.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleViewReason(leave)} className="p-1.5 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors cursor-pointer" title="View Reason">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                
                                                {leave.status === "pending" && (
                                                    <>
                                                        <div className="w-px h-4 bg-gray-700 mx-1"></div>
                                                        <button onClick={() => handleApprove(leave._id)} className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors cursor-pointer" title="Approve">
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleReject(leave._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Reject">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No leave requests found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Reason Modal */}
            {selectedLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <CalendarOff className="w-5 h-5 text-orange-500" /> Leave Request Details
                            </h2>
                            <button onClick={() => setSelectedLeave(null)} className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Employee Info Header */}
                            <div className="flex items-center gap-4 bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                                <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg font-bold text-orange-400">
                                    {(selectedLeave.employeeId?.name || "?").charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">{selectedLeave.employeeId?.name || "—"}</h3>
                                    <p className="text-xs text-gray-500">{selectedLeave.employeeId?.email || "—"}</p>
                                </div>
                                <div className="ml-auto">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                        selectedLeave.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                        selectedLeave.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                        'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                        {formatStatus(selectedLeave.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Request Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Leave Type</p>
                                    <p className="text-sm font-medium text-gray-200">{formatStatus(selectedLeave.leaveType)}</p>
                                </div>
                                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Duration</p>
                                    <p className="text-sm font-medium text-gray-200">{calcDays(selectedLeave.fromDate, selectedLeave.toDate)} Day(s)</p>
                                </div>
                                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">From Date</p>
                                    <p className="text-sm font-medium text-gray-200">{formatDate(selectedLeave.fromDate)}</p>
                                </div>
                                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">To Date</p>
                                    <p className="text-sm font-medium text-gray-200">{formatDate(selectedLeave.toDate)}</p>
                                </div>
                            </div>

                            {/* Reason Box */}
                            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reason for Leave</p>
                                <p className="text-sm text-gray-300 leading-relaxed bg-[#1a1a1a] p-3 rounded-lg border border-gray-800">
                                    "{selectedLeave.reason || "No reason provided"}"
                                </p>
                            </div>
                        </div>

                        {/* Action Footer */}
                        {selectedLeave.status === "pending" ? (
                            <div className="px-6 py-4 border-t border-gray-800 flex justify-end gap-3 shrink-0 bg-[#111111]">
                                <button onClick={() => setSelectedLeave(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={() => handleReject(selectedLeave._id)} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2">
                                    <X className="w-4 h-4" /> Reject
                                </button>
                                <button onClick={() => handleApprove(selectedLeave._id)} className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600 transition-colors flex items-center gap-2">
                                    <Check className="w-4 h-4" /> Approve
                                </button>
                            </div>
                        ) : (
                            <div className="px-6 py-4 border-t border-gray-800 flex justify-end gap-3 shrink-0 bg-[#111111]">
                                <button onClick={() => setSelectedLeave(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 transition-colors">
                                    Close Details
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};