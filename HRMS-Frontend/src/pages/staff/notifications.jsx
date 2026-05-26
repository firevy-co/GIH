import React, { useState } from "react";
import { Bell, Check, Trash2, MailOpen, Mail, Filter, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

export const StaffNotifications = () => {
    const [filter, setFilter] = useState("All");
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

    // Filtering logic
    const filteredNotifications = notifications.filter(notif => {
        if (filter === "Unread") return !notif.isRead;
        if (filter === "Read") return notif.isRead;
        return true;
    });

    const getIconForType = (type) => {
        switch (type) {
            case "system": return <Bell className="w-5 h-5 text-purple-500" />;
            case "success": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case "warning": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case "info":
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgForType = (type) => {
        switch (type) {
            case "system": return "bg-purple-500/10 border-purple-500/20";
            case "success": return "bg-green-500/10 border-green-500/20";
            case "warning": return "bg-amber-500/10 border-amber-500/20";
            case "info":
            default: return "bg-blue-500/10 border-blue-500/20";
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-lg shadow-blue-500/20">
                                {unreadCount} New
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Stay updated with system alerts and personal messages.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Filters */}
                    <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-gray-800">
                        {["All", "Unread", "Read"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    filter === f 
                                    ? "bg-blue-500/10 text-blue-400" 
                                    : "text-gray-400 hover:text-gray-200"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    
                    {/* Mark all read */}
                    {unreadCount > 0 && (
                        <button 
                            onClick={markAllAsRead}
                            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-gray-700 whitespace-nowrap"
                        >
                            <Check className="w-4 h-4" /> Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications Feed */}
            <div className="space-y-4">
                {filteredNotifications.length > 0 ? filteredNotifications.map((notif) => (
                    <div 
                        key={notif.id} 
                        className={`relative group bg-[#1a1a1a] border rounded-xl p-5 transition-all duration-300 hover:shadow-lg ${
                            notif.isRead 
                            ? "border-gray-800 opacity-70 hover:opacity-100" 
                            : "border-blue-500/30 shadow-blue-500/5"
                        }`}
                    >
                        {/* Unread Indicator Dot */}
                        {!notif.isRead && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#111111] animate-pulse"></div>
                        )}

                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${getBgForType(notif.type)}`}>
                                {getIconForType(notif.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-1">
                                    <h3 className={`text-base font-bold truncate ${notif.isRead ? "text-gray-300" : "text-white"}`}>
                                        {notif.title}
                                    </h3>
                                    <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                                        {notif.date}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed pr-8">
                                    {notif.message}
                                </p>
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a]/90 backdrop-blur-sm pl-4 py-2 rounded-l-xl">
                                {!notif.isRead && (
                                    <button 
                                        onClick={() => markAsRead(notif.id)}
                                        className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition-colors border border-blue-500/20 hover:border-blue-500" 
                                        title="Mark as Read"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                                <button 
                                    onClick={() => deleteNotification(notif.id)}
                                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors border border-red-500/20 hover:border-red-500" 
                                    title="Delete Notification"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center text-gray-400 mb-4">
                            <MailOpen className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-300">No Notifications</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-sm">
                            You're all caught up! There are no {filter !== "All" ? filter.toLowerCase() : ""} notifications to display right now.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
