import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Plus, X, CalendarDays, CheckCircle2, XCircle, Clock, FileText, AlertCircle, Loader2 } from "lucide-react";
import { fetchLeaves, applyLeave } from "../../redux/slices/leaveSlice";

export const StaffLeaves = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { leaves, loading } = useSelector((state) => state.leaves);

    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    
    // Form State
    const [leaveType, setLeaveType] = useState("Casual Leave");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (user?._id) {
            dispatch(fetchLeaves({ employeeId: user._id }));
        }
    }, [dispatch, user]);

    // Calculate dynamic leave balances based on approved leave requests in the database
    const leaveBalance = useMemo(() => {
        const balance = {
            casual: { total: 10, used: 0 },
            sick: { total: 7, used: 0 },
            paid: { total: 15, used: 0 }
        };

        leaves.forEach((leave) => {
            if (leave.status === "approved") {
                const start = new Date(leave.fromDate);
                const end = new Date(leave.toDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                if (leave.leaveType === "Casual Leave") {
                    balance.casual.used += diffDays;
                } else if (leave.leaveType === "Sick Leave") {
                    balance.sick.used += diffDays;
                } else if (leave.leaveType === "Paid Leave") {
                    balance.paid.used += diffDays;
                }
            }
        });

        return balance;
    }, [leaves]);

    const handleApplySubmit = (e) => {
        e.preventDefault();
        if (!fromDate || !toDate || !reason) {
            alert("All fields are required.");
            return;
        }

        dispatch(applyLeave({
            employeeId: user._id,
            leaveType,
            fromDate,
            toDate,
            reason
        })).unwrap().then(() => {
            alert("Leave application submitted successfully!");
            setIsApplyModalOpen(false);
            setFromDate(""); 
            setToDate(""); 
            setReason("");
        }).catch((err) => {
            alert("Error applying for leave: " + err);
        });
    };

    const getStatusBadge = (status) => {
        const normalized = status ? status.toLowerCase() : "";
        switch (normalized) {
            case "approved":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
            case "pending":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" /> Pending</span>;
            case "rejected":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3" /> Rejected</span>;
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Leave Management</h1>
                    <p className="text-sm text-gray-400 mt-1">Track your leave balances and apply for new time off.</p>
                </div>
                <button 
                    onClick={() => setIsApplyModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Apply Leave
                </button>
            </div>

            {/* Leave Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Casual Leave */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CalendarDays className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Casual Leave
                        </h3>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-white">{Math.max(0, leaveBalance.casual.total - leaveBalance.casual.used)}</span>
                            <span className="text-sm font-medium text-gray-500 mb-1.5">/ {leaveBalance.casual.total} Remaining</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-800 h-2 rounded-full mt-5 overflow-hidden">
                            <div 
                                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (leaveBalance.casual.used / leaveBalance.casual.total) * 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">{leaveBalance.casual.used} days used</p>
                    </div>
                </div>

                {/* Sick Leave */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Sick Leave
                        </h3>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-white">{Math.max(0, leaveBalance.sick.total - leaveBalance.sick.used)}</span>
                            <span className="text-sm font-medium text-gray-500 mb-1.5">/ {leaveBalance.sick.total} Remaining</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-800 h-2 rounded-full mt-5 overflow-hidden">
                            <div 
                                className="bg-red-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (leaveBalance.sick.used / leaveBalance.sick.total) * 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">{leaveBalance.sick.used} days used</p>
                    </div>
                </div>

                {/* Paid Leave */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="w-24 h-24 text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Paid Leave
                        </h3>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-white">{Math.max(0, leaveBalance.paid.total - leaveBalance.paid.used)}</span>
                            <span className="text-sm font-medium text-gray-500 mb-1.5">/ {leaveBalance.paid.total} Remaining</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-800 h-2 rounded-full mt-5 overflow-hidden">
                            <div 
                                className="bg-green-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (leaveBalance.paid.used / leaveBalance.paid.total) * 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">{leaveBalance.paid.used} days used</p>
                    </div>
                </div>

            </div>

            {/* Leave History Table */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col mt-8">
                <div className="p-6 border-b border-gray-800 bg-[#111111]">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" /> Leave History
                    </h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-500 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Leave Type</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Applied Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                                        <span className="text-sm text-gray-500 block mt-2">Loading leave history...</span>
                                    </td>
                                </tr>
                            ) : leaves.length > 0 ? leaves.map((leave) => {
                                const start = new Date(leave.fromDate);
                                const end = new Date(leave.toDate);
                                const diffTime = Math.abs(end - start);
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                                return (
                                    <tr key={leave._id} className="hover:bg-[#1a1a1a] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-200">{leave.leaveType}</span>
                                                <span className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]" title={leave.reason}>
                                                    Reason: {leave.reason}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-gray-300">{formatDate(leave.fromDate)} <span className="text-gray-500 mx-1">to</span> {formatDate(leave.toDate)}</span>
                                                <span className="text-xs text-blue-400 font-bold mt-0.5">{diffDays} Day(s)</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-400">
                                            {formatDate(leave.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(leave.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-xs font-medium text-gray-400 italic">No Actions</span>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No leave requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Apply Leave Modal */}
            {isApplyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-[#111111]">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-500" /> Apply for Leave
                            </h2>
                            <button 
                                onClick={() => setIsApplyModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 p-1.5 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleApplySubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Leave Type</label>
                                <select 
                                    required
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="Casual Leave">Casual Leave</option>
                                    <option value="Sick Leave">Sick Leave</option>
                                    <option value="Paid Leave">Paid Leave</option>
                                    <option value="Unpaid Leave">Unpaid Leave</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">From Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">To Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reason for Leave</label>
                                <textarea 
                                    required
                                    rows="3"
                                    placeholder="Briefly explain the reason for your leave request..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                                ></textarea>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsApplyModalOpen(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-blue-500 hover:bg-blue-400 text-white px-4 py-3 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
