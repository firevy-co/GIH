import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthError } from "../../redux/slices/authSlice";

export const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Select auth state from Redux store
    const { loading, error, success, user } = useSelector((state) => state.auth);

    useEffect(() => {
        // Clear any previous Redux auth errors on mount
        dispatch(clearAuthError());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            setMessage({ type: "success", text: "Login successful! Redirecting..." });
            const timer = setTimeout(() => {
                if (user?.role === "admin") {
                    navigate("/admin/dashboard");
                } else if (user?.role === "staff") {
                    navigate("/staff/dashboard");
                } else {
                    navigate("/user/home");
                }
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [success, user, navigate]);

    useEffect(() => {
        if (error) {
            setMessage({ type: "error", text: error });
        }
    }, [error]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (!formData.email.trim() || !formData.password) {
            setMessage({ type: "error", text: "Please enter both email and password" });
            return;
        }

        // Dispatch login action via Redux
        dispatch(loginUser(formData));
    };

    return (
        <div className="w-full max-w-[480px] p-8 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 mx-4 transition-all duration-300">

            {/* Title Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
            </div>

            {/* Message Alerts */}
            {message.text && (
                <div
                    className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-all duration-300 ${message.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                >
                    {message.type === "success" ? (
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Email Input */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Email Address
                    </label>
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400 group-focus-within:text-black transition-colors duration-200">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                            </svg>
                        </span>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email...."
                            className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
                            required
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Password
                        </label>
                        <a
                            href="#forgot-password"
                            className="text-xs font-semibold text-gray-400 hover:text-black transition-colors"
                        >
                            Forgot Password?
                        </a>
                    </div>
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400 group-focus-within:text-black transition-colors duration-200">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </span>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-black transition-colors cursor-pointer"
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-3.5 px-4 bg-black text-white hover:bg-gray-900 rounded-xl text-sm font-semibold tracking-wide shadow-lg shadow-black/15 hover:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center gap-2 group cursor-pointer"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Signing In...
                        </>
                    ) : (
                        <>
                            Sign In
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </>
                    )}
                </button>
            </form>

            {/* Footer redirection */}
            <div className="mt-8 text-center border-t border-gray-100 pt-6">
                <p className="text-sm text-gray-500">
                    Don't have an account yet?{" "}
                    <Link
                        to="/register"
                        className="font-bold text-black hover:text-gray-700 hover:underline transition-colors focus:outline-none focus:underline"
                    >
                        Create Account
                    </Link>
                </p>
            </div>

        </div>
    );
};