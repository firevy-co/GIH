import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logoutUser } from "../../redux/slices/authSlice";
import { Bell, LogOut, Search, Check, MailOpen, Sun, Moon } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

export const StaffHeader = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const unreadNotifications = notifications.filter(n => !n.isRead);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/login");
    };

    const [theme, setTheme] = useState(() => localStorage.getItem("staff-theme") || "dark");

    useEffect(() => {
        const handleThemeChange = () => {
            setTheme(localStorage.getItem("staff-theme") || "dark");
        };
        window.addEventListener("staff-theme-changed", handleThemeChange);
        return () => window.removeEventListener("staff-theme-changed", handleThemeChange);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        localStorage.setItem("staff-theme", nextTheme);
        window.dispatchEvent(new Event("staff-theme-changed"));
    };

    return (
        <header className="h-16 w-full bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between px-6 shrink-0 text-white">
            {/* Left: Search Bar */}
            <div className="flex items-center gap-3 bg-[#1a1a1a] px-3.5 py-1.5 rounded-lg border border-gray-800 w-80 focus-within:border-blue-500 transition-all duration-200">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search anything..."
                    className="bg-transparent text-sm text-gray-200 placeholder-gray-500 focus:outline-none w-full"
                />
            </div>

            {/* Right: Notifications, Staff Info, and Logout */}
            <div className="flex items-center gap-5">
                {/* Notification Icon */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="relative w-10 h-10 rounded-lg border border-gray-800 hover:border-blue-500 hover:text-blue-400 flex items-center justify-center transition cursor-pointer text-gray-300 focus:outline-none"
                        title="Notifications"
                    >
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#151515]">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-blue-500" /> Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={markAllAsRead}
                                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-64 overflow-y-auto divide-y divide-gray-800 custom-scrollbar">
                                {unreadNotifications.length > 0 ? (
                                    unreadNotifications.slice(0, 4).map((notif) => (
                                        <div 
                                            key={notif.id} 
                                            className="p-3.5 flex flex-col gap-1 hover:bg-gray-800/45 transition-colors relative group bg-blue-500/[0.03]"
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="text-xs font-bold text-left text-blue-400">
                                                    {notif.title}
                                                </h4>
                                                <span className="text-[10px] text-gray-500 whitespace-nowrap">{notif.date}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 text-left line-clamp-2 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="self-end mt-1 text-[10px] font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                                <Check className="w-3 h-3" /> Mark read
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                                        <MailOpen className="w-8 h-8 text-gray-600" />
                                        <span className="text-xs">No unread notifications</span>
                                    </div>
                                )}
                            </div>

                            <Link 
                                to="/staff/notifications"
                                onClick={() => setIsOpen(false)}
                                className="block text-center py-2.5 bg-[#151515] border-t border-gray-800 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
                            >
                                View All Notifications
                            </Link>
                        </div>
                    )}
                </div>

                {/* Dark/Light Toggle */}
                <button
                    onClick={toggleTheme}
                    className="relative w-10 h-10 rounded-lg border border-gray-800 hover:border-blue-500 hover:text-blue-400 flex items-center justify-center transition cursor-pointer text-gray-300 focus:outline-none"
                    title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                >
                    {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-gray-800"></div>

                {/* Profile Widget */}
                <Link to="/staff/profile" className="flex items-center gap-3 group focus:outline-none">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold group-hover:scale-105 transition-transform duration-200">
                        {user?.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-semibold text-gray-200 group-hover:text-orange-400 transition-colors">
                            {user?.name || "Staff Member"}
                        </span>
                        <span className="text-[10px] text-gray-500">
                            {user?.email || "staff@hrms.com"}
                        </span>
                    </div>
                </Link>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="bg-gray-800 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-medium transition duration-300 shadow-md flex items-center gap-2 cursor-pointer text-white"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};
