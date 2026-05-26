import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice";
import { Mail, MapPin, Search, Bell, LogOut, LogIn, User as UserIcon, Check, MailOpen } from "lucide-react";
import Logo from "../../assets/GIH-logo.png";
import { useNotifications } from "../../hooks/useNotifications";

export const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Read authentication status and user details from Redux
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const unreadNotifications = notifications.filter(n => !n.isRead);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [theme, setTheme] = useState(() => localStorage.getItem("user-theme") || "light");

    useEffect(() => {
        const handleThemeChange = () => {
            setTheme(localStorage.getItem("user-theme") || "light");
        };
        window.addEventListener("user-theme-changed", handleThemeChange);
        return () => window.removeEventListener("user-theme-changed", handleThemeChange);
    }, []);

    // Scroll state
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Set scrolled state for transparency
            setIsScrolled(currentScrollY > 20);

            // Handle visibility based on scroll direction
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false); // Scrolling down
            } else {
                setIsVisible(true);  // Scrolling up
            }
            
            lastScrollY = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Setup dynamic menus with correct routes
    const menus = [
        { name: "Home", path: "/user/home" },
        { name: "Investments", path: "/user/investments" },
        { name: "Documents", path: "/user/documents" },
        { name: "Notifications", path: "/user/notifications" },
        { name: "Profile", path: "/user/profile" },
    ];

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/login");
    };

    return (
        <header className={`w-full shadow-sm sticky top-0 z-50 transition-all duration-300 ${
            theme === "dark"
                ? isScrolled ? 'bg-[#0f172a]/80 backdrop-blur-lg border-b border-slate-800 text-gray-100' : 'bg-[#0f172a] text-gray-100'
                : isScrolled ? 'bg-white/80 backdrop-blur-lg text-gray-800' : 'bg-white text-gray-800'
        } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            {/* Top Contact Bar */}
            <div className="w-full">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2 text-sm text-gray-500">
                    <div className="flex items-center gap-6">
                        <div className="flex pl-46 items-center gap-2">
                            <Mail className={`w-4 h-4 ${theme === "dark" ? "text-sky-400" : "text-[#2c3f5a]"}`} />
                            <a href="mailto:support@hrms.com" className={`transition ${theme === "dark" ? "text-gray-400 hover:text-sky-400" : "text-gray-500 hover:text-[#2c3f5a]"}`}>
                                support@hrms.com
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link to="/user/profile" className={`flex items-center gap-2 transition group ${theme === "dark" ? "text-gray-400 hover:text-sky-400" : "text-gray-500 hover:text-[#2c3f5a]"}`}>
                                <UserIcon className={`w-4 h-4 transition-transform group-hover:scale-110 ${theme === "dark" ? "text-sky-400" : "text-[#2c3f5a]"}`} />
                                <span className={`text-xs font-semibold group-hover:underline ${theme === "dark" ? "text-sky-400" : "text-[#2c3f5a]"}`}>
                                    Hello, {user?.name || "User"}
                                </span>
                            </Link>
                        ) : (
                            <Link to="/login" className={`flex items-center gap-1.5 transition font-medium ${theme === "dark" ? "text-gray-450 hover:text-sky-400" : "text-gray-500 hover:text-[#2c3f5a]"}`}>
                                <LogIn className={`w-4 h-4 ${theme === "dark" ? "text-sky-400" : "text-[#2c3f5a]"}`} />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                {/* Logo Section */}
                <Link
                    to={
                        !isAuthenticated
                            ? "/"
                            : user?.role === "admin"
                                ? "/admin/dashboard"
                                : user?.role === "staff"
                                    ? "/staff/dashboard"
                                    : "/user/home"
                    }
                    className="flex items-center gap-3 group focus:outline-none"
                >
                    <img src={Logo} alt="GIH Logo" className="h-10 object-contain" />
                </Link>

                {/* Dynamic Navigation Menu */}
                <ul className="hidden pr-56 lg:flex items-center gap-8 text-[13px] font-bold tracking-wider">
                    {menus.map((menu, index) => (
                        <li key={index}>
                            <NavLink
                                to={menu.path}
                                className={({ isActive }) =>
                                    `relative py-1 transition duration-300 after:absolute after:left-0 after:-bottom-2 after:h-[2px] ${
                                        theme === "dark" ? "after:bg-sky-400" : "after:bg-[#2c3f5a]"
                                    } after:transition-all ${isActive
                                        ? `${theme === "dark" ? "text-sky-400" : "text-[#2c3f5a]"} after:w-full`
                                        : `${theme === "dark" ? "text-gray-300 hover:text-sky-400" : "text-gray-800 hover:text-[#2c3f5a]"} after:w-0 hover:after:w-full`
                                    }`
                                }
                            >
                                {menu.name.toUpperCase()}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Search Icon */}
                    <button
                        onClick={() => navigate("/user/search")}
                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer shadow-sm ${
                            theme === "dark"
                                ? "border-slate-700 text-gray-200 hover:border-sky-400 hover:text-sky-400 bg-slate-800"
                                : "border-gray-200 text-gray-800 hover:border-[#2c3f5a] hover:text-[#2c3f5a] bg-white"
                        }`}
                        title="Search"
                    >
                        <Search className="w-4 h-4" />
                    </button>

                    {/* Notification Icon & Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer focus:outline-none shadow-sm ${
                                theme === "dark"
                                    ? "border-slate-700 text-gray-200 hover:border-sky-400 hover:text-sky-400 bg-slate-800"
                                    : "border-gray-200 text-gray-800 hover:border-[#2c3f5a] hover:text-[#2c3f5a] bg-white"
                            }`}
                            title="Notifications"
                        >
                            <Bell className="w-4 h-4" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {isOpen && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className={`p-4 border-b flex justify-between items-center ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-gray-55 border-gray-100"}`}>
                                    <h3 className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                                        <Bell className={`w-4 h-4 ${theme === "dark" ? "text-sky-400" : "text-[#2c3f5a]"}`} /> Notifications
                                    </h3>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={markAllAsRead}
                                            className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-sky-400 hover:text-sky-300" : "text-[#2c3f5a] hover:text-[#1a2636]"}`}
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                <div className={`max-h-64 overflow-y-auto divide-y custom-scrollbar ${theme === "dark" ? "divide-slate-800 bg-slate-900" : "divide-gray-100 bg-white"}`}>
                                    {unreadNotifications.length > 0 ? (
                                        unreadNotifications.slice(0, 4).map((notif) => (
                                            <div 
                                                key={notif.id} 
                                                className={`p-3.5 flex flex-col gap-1 hover:bg-gray-50/5 transition-colors relative group ${theme === "dark" ? "bg-slate-900/40" : "bg-[#2c3f5a]/[0.03]"}`}
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className={`text-xs font-bold text-left ${theme === "dark" ? "text-sky-400" : "text-[#2c3f5a]"}`}>
                                                        {notif.title}
                                                    </h4>
                                                    <span className="text-[10px] text-gray-500 whitespace-nowrap">{notif.date}</span>
                                                </div>
                                                <p className={`text-[11px] text-left line-clamp-2 leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                                    {notif.message}
                                                </p>
                                                <button
                                                    onClick={() => markAsRead(notif.id)}
                                                    className={`self-end mt-1 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${theme === "dark" ? "text-sky-400 hover:text-sky-300" : "text-[#2c3f5a] hover:text-[#1a2636]"}`}
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Mark read
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                                            <MailOpen className="w-8 h-8 text-gray-300" />
                                            <span className="text-xs text-gray-500">No unread notifications</span>
                                        </div>
                                    )}
                                </div>

                                <Link 
                                    to="/user/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className={`block text-center py-2.5 border-t text-xs font-bold transition-colors uppercase tracking-wider ${
                                        theme === "dark"
                                            ? "bg-slate-800 border-slate-700 text-sky-400 hover:text-sky-300"
                                            : "bg-gray-50 border-gray-100 text-[#2c3f5a] hover:text-[#1a2636]"
                                    }`}
                                >
                                    View All Notifications
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Authentication Logic (Logout vs Login Link) */}
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className={`px-6 py-2.5 rounded-full text-[13px] font-bold tracking-wide transition-colors shadow-md flex items-center gap-2 cursor-pointer ${
                                theme === "dark"
                                    ? "bg-sky-500 hover:bg-sky-650 text-slate-900"
                                    : "bg-[#2c3f5a] hover:bg-[#1a2636] text-white"
                            }`}
                        >
                            <LogOut className="w-4 h-4" />
                            <span>LOGOUT</span>
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className={`px-6 py-2.5 rounded-full text-[13px] font-bold tracking-wide transition-colors shadow-md flex items-center gap-2 ${
                                theme === "dark"
                                    ? "bg-sky-500 hover:bg-sky-650 text-slate-900"
                                    : "bg-[#2c3f5a] hover:bg-[#1a2636] text-white"
                            }`}
                        >
                            <LogIn className="w-4 h-4" />
                            <span>SIGN IN</span>
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
};