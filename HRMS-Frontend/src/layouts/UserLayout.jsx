import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../components/user/Header";

export const UserLayout = () => {
    const [theme, setTheme] = useState(() => localStorage.getItem("user-theme") || "light");

    useEffect(() => {
        const handleThemeChange = () => {
            setTheme(localStorage.getItem("user-theme") || "light");
        };
        window.addEventListener("user-theme-changed", handleThemeChange);
        return () => window.removeEventListener("user-theme-changed", handleThemeChange);
    }, []);

    return (
        <div className={`flex flex-col w-full min-h-screen transition-colors duration-300 ${theme === "dark" ? "dark bg-[#080c14] text-gray-100" : "bg-white text-gray-900"}`}>
            <Header />
            <main className="flex-1 w-full">
                <Outlet />
            </main>
        </div>
    )
}