import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Filter, Eye, Edit2, Ban, Trash2, ChevronLeft, ChevronRight, UserPlus, Loader2, X, Save, User, Mail, Phone, Shield } from "lucide-react";
import { UserDetails } from "../../components/admin/user-details";
import { fetchAllUsers, deleteUser, updateUserStatus } from "../../redux/slices/userSlice";

export const AdminUsers = () => {
    const dispatch = useDispatch();
    const { users, loading, deleteLoading } = useSelector((state) => state.users);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [kycFilter, setKycFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "user",
        status: "Active",
        kycStatus: "pending"
    });

    // Fetch users from database on mount
    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // Filtering logic
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  user.email?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || user.status === statusFilter;
            const kycVal = user.kycStatus?.charAt(0).toUpperCase() + user.kycStatus?.slice(1);
            const matchesKyc = kycFilter === "All" || kycVal === kycFilter;

            return matchesSearch && matchesStatus && matchesKyc;
        });
    }, [users, searchQuery, statusFilter, kycFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            role: user.role || "user",
            status: user.status || "Active",
            kycStatus: user.kycStatus || "pending"
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        dispatch(updateUserStatus({ 
            userId: selectedUser._id, 
            ...editFormData 
        })).unwrap()
        .then(() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
        })
        .catch(err => {
            alert("Failed to update user: " + err);
        });
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            dispatch(deleteUser(userId));
        }
    };

    const handleToggleBlock = (user) => {
        const newStatus = user.status === "Blocked" ? "Active" : "Blocked";
        dispatch(updateUserStatus({ userId: user._id, status: newStatus }));
    };

    // Normalize kycStatus for display (backend stores lowercase)
    const formatKyc = (status) => {
        if (!status) return "Pending";
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage investors and clients, track KYC, and monitor accounts.</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search */}
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                </div>

                {/* Dropdown Filters */}
                <div className="flex w-full md:w-auto gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-gray-500 hidden md:block" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full md:w-40 bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Blocked">Blocked</option>
                        </select>
                    </div>

                    <select 
                        value={kycFilter}
                        onChange={(e) => setKycFilter(e.target.value)}
                        className="w-full md:w-40 bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                        <option value="All">All KYC</option>
                        <option value="Verified">Verified</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-500 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Name / Email</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4 text-center">KYC Status</th>
                                <th className="px-6 py-4 text-center">Investments</th>
                                <th className="px-6 py-4 text-center">Role</th>
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
                                            <span className="text-sm">Loading users from database...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-200 group-hover:text-orange-400 transition-colors">{user.name}</span>
                                            <span className="text-xs text-gray-500 mt-0.5">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user.phone || "—"}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                            formatKyc(user.kycStatus) === 'Verified' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                                            formatKyc(user.kycStatus) === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                            'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                            {formatKyc(user.kycStatus)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium text-gray-300">
                                        {user.investments || 0}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2.5 py-1 bg-gray-850 rounded-md text-[10px] font-bold uppercase tracking-wider text-orange-400 border border-orange-500/20">
                                            {user.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                            user.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                            user.status === 'Blocked' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                            'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                        }`}>
                                            {user.status || "Active"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleViewUser(user)}
                                                className="p-1.5 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors cursor-pointer" title="View"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleEditUser(user)}
                                                className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors cursor-pointer" title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleToggleBlock(user)}
                                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                    user.status === 'Blocked' 
                                                        ? 'text-green-400 hover:bg-green-500/10' 
                                                        : 'text-gray-400 hover:text-amber-400 hover:bg-amber-500/10'
                                                }`} 
                                                title={user.status === 'Blocked' ? 'Unblock' : 'Block'}
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user._id)}
                                                disabled={deleteLoading}
                                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50" 
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No users found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="bg-[#1a1a1a] px-6 py-4 border-t border-gray-800 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Showing <span className="font-semibold text-gray-300">{(currentPage - 1) * usersPerPage + 1}</span> to <span className="font-semibold text-gray-300">{Math.min(currentPage * usersPerPage, filteredUsers.length)}</span> of <span className="font-semibold text-gray-300">{filteredUsers.length}</span> entries
                        </span>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                                        currentPage === page 
                                            ? 'bg-orange-500 text-white border border-orange-500' 
                                            : 'border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            <UserDetails 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                user={selectedUser} 
            />

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
                    <form 
                        onSubmit={handleSaveEdit}
                        className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-[#111111] shrink-0">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-green-500" /> Edit User Profile
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 p-1.5 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            required
                                            value={editFormData.name}
                                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                            className="w-full bg-[#111] border border-gray-700 text-gray-200 text-sm rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="email"
                                            required
                                            value={editFormData.email}
                                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                            className="w-full bg-[#111] border border-gray-700 text-gray-200 text-sm rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            value={editFormData.phone}
                                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                            className="w-full bg-[#111] border border-gray-700 text-gray-200 text-sm rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">User Role</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <select
                                            value={editFormData.role}
                                            onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                            className="w-full bg-[#111] border border-gray-700 text-gray-300 text-sm rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                                        >
                                            <option value="user">Standard User (Investor)</option>
                                            <option value="staff">Internal Staff (HR)</option>
                                            <option value="manager">Manager Level</option>
                                            <option value="admin">System Admin</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Account Status</label>
                                    <select
                                        value={editFormData.status}
                                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                        className="w-full bg-[#111] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Blocked">Blocked</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">KYC Document Status</label>
                                    <select
                                        value={editFormData.kycStatus}
                                        onChange={(e) => setEditFormData({ ...editFormData, kycStatus: e.target.value })}
                                        className="w-full bg-[#111] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                                    >
                                        <option value="pending">Pending Review</option>
                                        <option value="verified">Verified</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-800 bg-[#111111] flex gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all border border-gray-700 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Save className="w-4 h-4" /> Save Details
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};