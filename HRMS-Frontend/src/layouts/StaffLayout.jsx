import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/staff/Sidebar";
import { StaffHeader } from "../components/staff/Header";

export const StaffLayout = () => {
    const [theme, setTheme] = useState(() => localStorage.getItem("staff-theme") || "dark");

    useEffect(() => {
        const handleThemeChange = () => {
            setTheme(localStorage.getItem("staff-theme") || "dark");
        };
        window.addEventListener("staff-theme-changed", handleThemeChange);
        return () => window.removeEventListener("staff-theme-changed", handleThemeChange);
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
                <StaffHeader />

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
