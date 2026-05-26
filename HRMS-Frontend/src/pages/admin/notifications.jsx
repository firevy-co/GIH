import React, { useState, useMemo, useEffect } from "react";
import { Send, Bell, Users, Clock, CheckCircle2, AlertCircle, FileText, BarChart2 } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

export const AdminNotifications = () => {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [target, setTarget] = useState("All Employees");
    const [type, setType] = useState("Announcement");
    
    const { notifications, addNotification } = useNotifications();

    // Group individual notification database records to compute broadcast statistics
    const history = useMemo(() => {
        const groups = {};
        notifications.forEach((notif) => {
            const key = `${notif.title}::${notif.message}`;
            if (!groups[key]) {
                groups[key] = {
                    id: notif.id,
                    title: notif.title,
                    message: notif.message,
                    date: notif.date,
                    target: "All Employees",
                    type: "Announcement",
                    readCount: 0,
                    totalCount: 0
                };
            }
            groups[key].totalCount++;
            if (notif.isRead) {
                groups[key].readCount++;
            }
        });
        return Object.values(groups);
    }, [notifications]);

    const handleSend = (e) => {
        e.preventDefault();
        addNotification(title, message);
        alert("Broadcast sent successfully!");
        setTitle("");
        setMessage("");
    };

    // Overall Analytics
    const analytics = useMemo(() => {
        let totalSent = history.length;
        let totalReads = 0;
        let totalTargets = 0;

        history.forEach(h => {
            totalReads += h.readCount;
            totalTargets += h.totalCount;
        });

        const avgReadRate = totalTargets > 0 ? Math.round((totalReads / totalTargets) * 100) : 0;

        return {
            totalSent,
            avgReadRate
        };
    }, [history]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Notification Center</h1>
                    <p className="text-sm text-gray-400 mt-1">Broadcast announcements to staff and track read receipts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Send Notification Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 shadow-lg">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-3">
                            <Send className="w-5 h-5 text-orange-500" />
                            <h2 className="text-lg font-bold text-white">Send Notification</h2>
                        </div>

                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Notification Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Mandatory Townhall Meeting"
                                    className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Target Audience</label>
                                    <select 
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                        className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                                    >
                                        <option>All Employees</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Message Type</label>
                                    <select 
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                                    >
                                        <option>Announcement</option>
                                        <option>Alert</option>
                                        <option>Policy</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Message Content</label>
                                <textarea 
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows="5"
                                    placeholder="Write your announcement here..."
                                    className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                                <Send className="w-4 h-4" /> Broadcast Message
                            </button>
                        </form>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 shadow-lg">
                        <h4 className="text-sm font-semibold text-white mb-4 border-b border-gray-800 pb-2">Delivery Analytics (30 Days)</h4>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-medium mb-1">
                                    <span className="text-gray-400">Total Sent Groups</span>
                                    <span className="text-white">{analytics.totalSent}</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-1.5"><div className="bg-orange-500 h-1.5 rounded-full w-full"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-medium mb-1">
                                    <span className="text-gray-400">Average Read Rate</span>
                                    <span className="text-green-400">{analytics.avgReadRate}%</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-1.5">
                                    <div 
                                        className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${analytics.avgReadRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Notification History */}
                <div className="lg:col-span-2">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-lg flex flex-col h-full">
                        <div className="flex items-center justify-between p-5 border-b border-gray-800 shrink-0">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-500" /> Notification History
                            </h2>
                        </div>
                        
                        <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[600px] custom-scrollbar">
                            {history.length > 0 ? history.map((notif) => {
                                const readPercentage = notif.totalCount > 0 ? Math.round((notif.readCount / notif.totalCount) * 100) : 0;
                                const isFullyRead = readPercentage === 100;

                                return (
                                    <div key={notif.id} className="bg-[#1a1a1a] border border-gray-800 hover:border-gray-700 transition-colors rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between group">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                                                    Broadcast
                                                </span>
                                                <span className="text-xs text-gray-500">{notif.date}</span>
                                            </div>
                                            <h3 className="text-base font-bold text-gray-200 group-hover:text-orange-400 transition-colors">{notif.title}</h3>
                                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                                            
                                            <div className="flex items-center gap-3 mt-3">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                                    <Users className="w-3.5 h-3.5" /> {notif.target}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="sm:w-40 flex flex-col justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-gray-800 pt-3 sm:pt-0 sm:pl-4 mt-2 sm:mt-0">
                                            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                                                <span className="text-gray-400">Read Status</span>
                                                <span className={isFullyRead ? "text-green-400" : "text-amber-400"}>{readPercentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-500 ${isFullyRead ? 'bg-green-500' : 'bg-amber-500'}`} 
                                                    style={{ width: `${readPercentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-[10px] text-gray-500 text-right font-mono">
                                                {notif.readCount} / {notif.totalCount} read
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-12 text-gray-500">
                                    No notification history found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};