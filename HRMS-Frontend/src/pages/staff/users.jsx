import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Eye, FileText, Mail, Phone, CheckCircle2, XCircle, User, Filter, X, CreditCard, Clock, Loader2 } from "lucide-react";
import { fetchAllUsers } from "../../redux/slices/userSlice";

export const StaffUsers = () => {
    const dispatch = useDispatch();
    const { users, loading } = useSelector((state) => state.users);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterKYC, setFilterKYC] = useState("All");

    // Modal State
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // Filtering Logic
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (user.email || "").toLowerCase().includes(searchQuery.toLowerCase());
            
            const investmentStatus = user.status || "Inactive";
            const matchesStatus = filterStatus === "All" || investmentStatus === filterStatus;
            
            const kycStatus = user.kycStatus ? user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1) : "Pending";
            const matchesKYC = filterKYC === "All" || kycStatus === filterKYC;
            
            return matchesSearch && matchesStatus && matchesKYC;
        });
    }, [users, searchQuery, filterStatus, filterKYC]);

    const getStatusBadge = (status) => {
        const normalized = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "";
        switch (normalized) {
            case "Active":
            case "Verified":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle2 className="w-3 h-3" /> {status}</span>;
            case "Pending":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" /> {status}</span>;
            case "Inactive":
            case "Rejected":
            case "Blocked":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3" /> {status}</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-500/10 text-gray-400 border border-gray-500/20">{status || "Unknown"}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Assigned Users</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage and assist your assigned users/investors.</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">

                {/* Advanced Filters Bar */}
                <div className="p-5 border-b border-gray-800 bg-[#111111] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">

                    {/* Search by User/Email */}
                    <div className="lg:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
                        />
                    </div>

                    {/* Filter by Investment Status */}
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                            <option value="All">All Investment Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Filter by KYC Status */}
                    <div>
                        <select
                            value={filterKYC}
                            onChange={(e) => setFilterKYC(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                            <option value="All">All KYC Statuses</option>
                            <option value="Verified">Verified</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-500 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4">Investment</th>
                                <th className="px-6 py-4">KYC Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                                        <span className="text-sm text-gray-500 block mt-2">Loading users...</span>
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? filteredUsers.map((user) => {
                                const investmentStatus = user.status || "Inactive";
                                const kycStatus = user.kycStatus ? user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1) : "Pending";
                                const assignedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "—";
                                
                                return (
                                    <tr key={user._id} className="hover:bg-[#1a1a1a] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-bold shrink-0">
                                                    {(user.name || "?").charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-200 group-hover:text-orange-400 transition-colors">{user.name}</span>
                                                    <span className="text-[10px] text-gray-500">Assigned: {assignedDate}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-gray-300 text-xs">
                                                    <Mail className="w-3.5 h-3.5 text-gray-500" /> {user.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-300 text-xs">
                                                    <Phone className="w-3.5 h-3.5 text-gray-500" /> {user.phone || "—"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(investmentStatus)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(kycStatus)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="p-2 bg-gray-800 hover:bg-orange-500 hover:text-white text-gray-400 rounded-lg transition-colors border border-gray-700 hover:border-orange-500 cursor-pointer" title="View Details">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <a href={`mailto:${user.email}`} className="p-2 bg-gray-800 hover:bg-green-500 hover:text-white text-gray-400 rounded-lg transition-colors border border-gray-700 hover:border-green-500 cursor-pointer" title="Contact User">
                                                    <Mail className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <User className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-lg font-semibold text-gray-400">No users found</p>
                                            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-[#111111] shrink-0">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-orange-500" /> User Details Overview
                            </h2>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 p-1.5 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">

                            {/* Profile Header */}
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-full bg-orange-500/10 border-2 border-orange-500/20 flex items-center justify-center text-3xl text-orange-500 font-bold shrink-0">
                                    {(selectedUser.name || "?").charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-white">{selectedUser.name}</h3>
                                    <p className="text-sm text-gray-400">Client ID: {selectedUser._id}</p>
                                </div>
                                <div className="flex flex-col gap-2 text-right">
                                    {getStatusBadge(selectedUser.kycStatus ? selectedUser.kycStatus.charAt(0).toUpperCase() + selectedUser.kycStatus.slice(1) : "Pending")}
                                    {getStatusBadge(selectedUser.status || "Inactive")}
                                </div>
                            </div>

                            <hr className="border-gray-800" />

                            {/* Contact Information */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-200 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-orange-500" /> Contact Information
                                </h4>
                                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                                        <p className="text-sm text-gray-200 font-medium">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                                        <p className="text-sm text-gray-200 font-medium">{selectedUser.phone || "—"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Investments Summary */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-200 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-green-500" /> Investment Info
                                </h4>
                                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-green-500/10 flex items-center justify-center text-green-500">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-200">Investments Count</p>
                                            <p className="text-xs text-gray-500">Registered portfolios</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-400">{selectedUser.investments || 0} active</p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer Actions */}
                        <div className="p-6 border-t border-gray-800 bg-[#111111] flex gap-3 shrink-0">
                            <button onClick={() => setSelectedUser(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg text-sm font-bold transition-all border border-gray-700 cursor-pointer">
                                Close
                            </button>
                            <a href={`mailto:${selectedUser.email}`} className="flex-1 bg-orange-500 hover:bg-orange-400 text-white px-4 py-3 rounded-lg text-sm font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer">
                                <Mail className="w-4 h-4" /> Contact User
                            </a>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};
