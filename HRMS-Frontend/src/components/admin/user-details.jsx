import React from "react";
import { X, User, Mail, Phone, ShieldCheck, MapPin, Calendar, FileText, Bell, Activity, Briefcase } from "lucide-react";

export const UserDetails = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-orange-500" /> User Details
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-sm text-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Left Column: Profile Info */}
                        <div className="md:col-span-1 space-y-6">
                            <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800 flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl font-bold text-orange-400 mb-4">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="text-lg font-bold text-white">{user.name}</h3>
                                <p className="text-xs text-gray-500">{user.email}</p>
                                <div className="mt-4 flex gap-2">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                        (user.status || 'Active') === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                        (user.status || 'Active') === 'Blocked' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                        'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                    }`}>
                                        {user.status || 'Active'}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                        user.kycStatus === 'verified' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                                        user.kycStatus === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                        'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                        KYC {user.kycStatus ? user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1) : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800 space-y-4">
                                <h4 className="text-sm font-semibold text-white border-b border-gray-800 pb-2">Contact Information</h4>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span>{user.phone || '—'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span>{user.address || "123 Main St, NY, USA"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span>Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Tabs/Details */}
                        <div className="md:col-span-2 space-y-6">
                            
                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                                    <Briefcase className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                                    <div className="text-xl font-bold text-white">{user.investments || 0}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Investments</div>
                                </div>
                                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                                    <FileText className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                                    <div className="text-xl font-bold text-white">4</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Documents</div>
                                </div>
                                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                                    <Bell className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                                    <div className="text-xl font-bold text-white">12</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Alerts</div>
                                </div>
                                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                                    <Activity className="w-5 h-5 text-green-500 mx-auto mb-2" />
                                    <div className="text-xl font-bold text-white">34</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Actions</div>
                                </div>
                            </div>

                            {/* Recent Activity Logs */}
                            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
                                <h4 className="text-sm font-semibold text-white border-b border-gray-800 pb-3 mb-4">Recent Activity Logs</h4>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="mt-0.5"><ShieldCheck className="w-4 h-4 text-green-500" /></div>
                                        <div>
                                            <p className="text-sm text-gray-300">KYC Documents Approved</p>
                                            <p className="text-xs text-gray-500 mt-0.5">May 18, 2026 - 14:30</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="mt-0.5"><Briefcase className="w-4 h-4 text-orange-500" /></div>
                                        <div>
                                            <p className="text-sm text-gray-300">New Investment: Real Estate Fund Alpha</p>
                                            <p className="text-xs text-gray-500 mt-0.5">May 15, 2026 - 09:15</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="mt-0.5"><FileText className="w-4 h-4 text-orange-500" /></div>
                                        <div>
                                            <p className="text-sm text-gray-300">Uploaded Tax Form W-9</p>
                                            <p className="text-xs text-gray-500 mt-0.5">May 10, 2026 - 11:45</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-800 flex justify-end gap-3 shrink-0 bg-[#111111]">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        Close
                    </button>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/20 transition-all">
                        Contact User
                    </button>
                </div>
            </div>
        </div>
    );
};