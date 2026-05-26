import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/admin/Sidebar";
import { AdminHeader } from "../components/admin/Header";

export const AdminLayout = () => {
    const [theme, setTheme] = useState(() => localStorage.getItem("admin-theme") || "dark");

    useEffect(() => {
        const handleThemeChange = () => {
            setTheme(localStorage.getItem("admin-theme") || "dark");
        };
        window.addEventListener("admin-theme-changed", handleThemeChange);
        return () => window.removeEventListener("admin-theme-changed", handleThemeChange);
    }, []);

    return (
        <div className={`flex w-full h-screen overflow-hidden transition-colors duration-300 ${
            theme === "light" ? "light-mode bg-white text-gray-800" : "bg-[#0a0a0a]"
        }`}>
            {/* Sidebar on the left */}
            <Sidebar />

            {/* Main content pane on the right */}
            <div className="flex flex-col flex-1 h-full min-w-0">
                {/* Header at the top */}
                <AdminHeader />

                {/* Content body with dynamic outlet (pages) */}
                <main className="flex-1 overflow-y-auto p-6 text-gray-200">
                    <div className="max-w-8xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};