import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../../redux/slices/authSlice";

export const CheckAuth = ({ children }) => {
    const { isAuthenticated, token, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        // Verifies the session token validity against the backend database upon mounting
        if (token) {
            dispatch(checkAuth());
        }
    }, [dispatch, token]);

    // Show a clean loading state ONLY if we have a token but the user details are not loaded yet
    if (token && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#111111]">
                <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-400">Restoring session...</span>
                </div>
            </div>
        );
    }

    const isAuthRoute = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/";

    if (!isAuthenticated) {
        // If the user is not logged in and tries to access protected pages, redirect to Login
        if (!isAuthRoute) {
            return <Navigate to="/login" state={{ from: location }} replace />;
        }
    } else {
        // If the user is logged in and tries to access authentication pages, redirect to their proper dashboard
        if (isAuthRoute) {
            if (user?.role === "admin") {
                return <Navigate to="/admin/dashboard" replace />;
            }
            if (user?.role === "staff") {
                return <Navigate to="/staff/dashboard" replace />;
            }
            return <Navigate to="/user/home" replace />;
        }

        // Guard: Prevent regular users from accessing admin or staff routes
        if (user?.role === "user" && (location.pathname.startsWith("/admin") || location.pathname.startsWith("/staff"))) {
            return <Navigate to="/user/home" replace />;
        }

        // Guard: Prevent admin users from accessing user or staff routes
        if (user?.role === "admin" && (location.pathname.startsWith("/user") || location.pathname.startsWith("/staff"))) {
            return <Navigate to="/admin/dashboard" replace />;
        }

        // Guard: Prevent staff users from accessing user or admin routes
        if (user?.role === "staff" && (location.pathname.startsWith("/user") || location.pathname.startsWith("/admin"))) {
            return <Navigate to="/staff/dashboard" replace />;
        }
    }

    return <>{children}</>;
};

export default CheckAuth;
