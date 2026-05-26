import React, { useState } from "react";
import Logo from "../../assets/GIH-logo.png";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Clock,
    Calendar,
    FolderOpen,
    Users,
    Bell,
    User,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react";

export const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem("gih_sidebar_collapsed") === "true");

    const toggleCollapse = () => {
        const nextState = !isCollapsed;
        setIsCollapsed(nextState);
        localStorage.setItem("gih_sidebar_collapsed", String(nextState));
    };

    const navItems = [
        { name: "Dashboard", path: "/staff/dashboard", icon: LayoutDashboard },
        { name: "Attendance", path: "/staff/attendance", icon: Clock },
        { name: "Leaves", path: "/staff/leaves", icon: Calendar },
        { name: "Documents", path: "/staff/documents", icon: FolderOpen },
        { name: "Assigned Users", path: "/staff/users", icon: Users },
        { name: "Notifications", path: "/staff/notifications", icon: Bell },
        { name: "Profile", path: "/staff/profile", icon: User },
    ];

    return (
        <aside className={`relative transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"} bg-[#1a1a1a] text-white flex flex-col border-r border-gray-800 h-full shrink-0`}>
            {/* Toggle Button */}
            <button
                onClick={toggleCollapse}
                className="absolute top-20 -right-3 w-6 h-6 rounded-full bg-[#1a1a1a] border border-gray-800 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center text-gray-400 transition-all cursor-pointer shadow-md z-50 focus:outline-none"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                {isCollapsed ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
            </button>

            {/* Staff Brand / Logo */}
            <div className={`h-16 flex items-center border-b border-gray-800 transition-all duration-300 ${isCollapsed ? "px-2 justify-center" : "px-6"}`}>
                {!isCollapsed ? (
                    <div className="flex items-center gap-3">
                        <img src={Logo} alt="GIH Logo" className="h-10 object-contain" />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-wider">GIH PORTAL</span>
                            <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-1">
                                STAFF PORTAL
                            </span>
                        </div>
                    </div>
                ) : (
                    <img src={Logo} alt="GIH Logo" className="h-10 object-contain transition-all duration-300" />
                )}
            </div>

            {/* Sidebar Navigation Links */}
            <nav className="flex-1 px-3 py-6 overflow-y-auto space-y-1.5 custom-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            title={isCollapsed ? item.name : undefined}
                            className={({ isActive }) =>
                                `flex items-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                                    isCollapsed ? "justify-center h-11 w-11 mx-auto" : "gap-3 px-4 py-3"
                                } ${isActive
                                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                                }`
                            }
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span className="transition-all duration-300">{item.name}</span>}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};
