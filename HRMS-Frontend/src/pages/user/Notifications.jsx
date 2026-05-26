import React, { useState } from "react";
import { Bell, Check, Trash2, MailOpen, Info, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

export const Notifications = () => {
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
            case "system": return <Bell className="w-5 h-5 text-purple-600" />;
            case "success": return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
            case "warning": return <AlertTriangle className="w-5 h-5 text-amber-600" />;
            case "info":
            default: return <Info className="w-5 h-5 text-[#2c3f5a]" />;
        }
    };

    const getBgForType = (type) => {
        switch (type) {
            case "system": return "bg-purple-50 border-purple-200";
            case "success": return "bg-emerald-50 border-emerald-200";
            case "warning": return "bg-amber-50 border-amber-200";
            case "info":
            default: return "bg-blue-50 border-blue-200";
        }
    };

    return (
        <div className="w-full text-gray-900 font-sans p-6 md:p-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-[1400px] mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-gray-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-950 tracking-tight flex items-center gap-3">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="bg-[#2c3f5a] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                    {unreadCount} New
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1.5 font-medium">Stay updated with system updates and personal investor alerts.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        {/* Filters Segment */}
                        <div className="flex bg-[#eff2f6] p-1 rounded-xl border border-gray-200">
                            {["All", "Unread", "Read"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4.5 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                                        filter === f 
                                        ? "bg-[#2c3f5a] text-white shadow-sm" 
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
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
                                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm px-4.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                            >
                                <Check className="w-4 h-4 text-[#2c3f5a]" /> Mark all read
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications Feed */}
                <div className="space-y-4">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                className={`relative group bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                    notif.isRead 
                                    ? "opacity-75 hover:opacity-100" 
                                    : "border-l-4 border-l-[#2c3f5a]"
                                }`}
                            >
                                {/* Notification Icon & Text Body */}
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    {/* Icon Container */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${getBgForType(notif.type)}`}>
                                        {getIconForType(notif.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className={`text-base font-bold text-gray-950 ${notif.isRead ? "text-gray-700" : "text-gray-950"}`}>
                                                {notif.title}
                                            </h3>
                                            {!notif.isRead && (
                                                <span className="w-1.5 h-1.5 bg-[#2c3f5a] rounded-full" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-650 leading-relaxed pr-6">
                                            {notif.message}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Side Actions & Metadata */}
                                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 shrink-0 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{notif.date}</span>
                                    </div>

                                    <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notif.isRead && (
                                            <button 
                                                onClick={() => markAsRead(notif.id)}
                                                className="p-2 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-lg transition-colors border border-emerald-100 hover:border-emerald-500 cursor-pointer" 
                                                title="Mark as Read"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => deleteNotification(notif.id)}
                                            className="p-2 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-lg transition-colors border border-rose-100 hover:border-rose-500 cursor-pointer" 
                                            title="Delete Notification"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
                            <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-400 mb-4">
                                <MailOpen className="w-8 h-8 text-[#2c3f5a]" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No Notifications</h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-sm">
                                You're all caught up! There are no {filter !== "All" ? filter.toLowerCase() : ""} notifications to display right now.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};