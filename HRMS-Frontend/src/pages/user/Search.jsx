import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Search as SearchIcon,
    X,
    FileText,
    TrendingUp,
    Bell,
    User,
    ArrowRight,
    Clock,
    Sparkles,
    ChevronRight,
    Home,
    Filter,
    SlidersHorizontal,
} from "lucide-react";

// ─── Static Searchable Data ────────────────────────────────────────────────────
const SEARCH_DATA = [
    // Navigation / Pages
    { id: "nav-home", type: "page", label: "Home", desc: "Go to your dashboard", path: "/user/home", icon: "home" },
    { id: "nav-investments", type: "page", label: "Investments", desc: "View your investment portfolio", path: "/user/investments", icon: "chart" },
    { id: "nav-documents", type: "page", label: "Documents", desc: "Manage your KYC & uploaded documents", path: "/user/documents", icon: "file" },
    { id: "nav-notifications", type: "page", label: "Notifications", desc: "View all your notifications", path: "/user/notifications", icon: "bell" },
    { id: "nav-profile", type: "page", label: "Profile", desc: "Manage your personal profile & KYC", path: "/user/profile", icon: "user" },

    // Investments
    { id: "inv-sip", type: "investment", label: "SIP – Systematic Investment", desc: "Start a Systematic Investment Plan", path: "/user/investments", icon: "chart" },
    { id: "inv-mutual", type: "investment", label: "Mutual Funds", desc: "Explore mutual fund options", path: "/user/investments", icon: "chart" },
    { id: "inv-fd", type: "investment", label: "Fixed Deposits", desc: "View fixed deposit rates and plans", path: "/user/investments", icon: "chart" },
    { id: "inv-equity", type: "investment", label: "Equity Portfolio", desc: "Track your equity investments", path: "/user/investments", icon: "chart" },
    { id: "inv-bonds", type: "investment", label: "Bonds & Debentures", desc: "Explore bond investment options", path: "/user/investments", icon: "chart" },

    // Documents
    { id: "doc-pan", type: "document", label: "PAN Card", desc: "Upload or view your PAN Card", path: "/user/documents", icon: "file" },
    { id: "doc-aadhaar", type: "document", label: "Aadhaar Card", desc: "Upload or view your Aadhaar Card", path: "/user/documents", icon: "file" },
    { id: "doc-passport", type: "document", label: "Passport", desc: "Upload or view your Passport", path: "/user/documents", icon: "file" },
    { id: "doc-kyc", type: "document", label: "KYC Documents", desc: "Manage your Know Your Customer documents", path: "/user/profile", icon: "file" },
    { id: "doc-salary", type: "document", label: "Salary Slips", desc: "View and download salary slips", path: "/user/documents", icon: "file" },

    // Profile
    { id: "pro-info", type: "profile", label: "Personal Information", desc: "Edit your name, email, and contact details", path: "/user/profile", icon: "user" },
    { id: "pro-password", type: "profile", label: "Change Password", desc: "Update your account password", path: "/user/profile", icon: "user" },
    { id: "pro-avatar", type: "profile", label: "Profile Photo", desc: "Update your profile picture", path: "/user/profile", icon: "user" },
    { id: "pro-bank", type: "profile", label: "Bank Details", desc: "Manage your linked bank accounts", path: "/user/profile", icon: "user" },
    { id: "pro-nominee", type: "profile", label: "Nominee Details", desc: "Update nominee information", path: "/user/profile", icon: "user" },

    // Notifications
    { id: "notif-all", type: "notification", label: "All Notifications", desc: "View all notifications", path: "/user/notifications", icon: "bell" },
    { id: "notif-unread", type: "notification", label: "Unread Notifications", desc: "View only unread notifications", path: "/user/notifications", icon: "bell" },
    { id: "notif-alerts", type: "notification", label: "Investment Alerts", desc: "Check investment-related notifications", path: "/user/notifications", icon: "bell" },
];

const RECENT_SEARCHES_KEY = "hrms_recent_searches";
const MAX_RECENT = 5;

const CATEGORIES = ["All", "Pages", "Investments", "Documents", "Profile", "Notifications"];
const CATEGORY_MAP = {
    All: null,
    Pages: "page",
    Investments: "investment",
    Documents: "document",
    Profile: "profile",
    Notifications: "notification",
};

// ─── Icon Helper ───────────────────────────────────────────────────────────────
const ResultIcon = ({ icon, type }) => {
    const base = "w-5 h-5";
    const colorMap = {
        page: "text-[#2c3f5a] dark:text-sky-400",
        investment: "text-emerald-600 dark:text-emerald-400",
        document: "text-amber-600 dark:text-amber-400",
        profile: "text-purple-600 dark:text-purple-400",
        notification: "text-rose-500 dark:text-rose-400",
    };
    const color = colorMap[type] || "text-gray-500 dark:text-gray-400";

    if (icon === "home") return <Home className={`${base} ${color}`} />;
    if (icon === "chart") return <TrendingUp className={`${base} ${color}`} />;
    if (icon === "file") return <FileText className={`${base} ${color}`} />;
    if (icon === "bell") return <Bell className={`${base} ${color}`} />;
    if (icon === "user") return <User className={`${base} ${color}`} />;
    return <SearchIcon className={`${base} ${color}`} />;
};

const TypeBadge = ({ type }) => {
    const styles = {
        page: "bg-[#2c3f5a]/10 text-[#2c3f5a] dark:bg-sky-500/10 dark:text-sky-400",
        investment: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
        document: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
        profile: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
        notification: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
    };
    const labels = {
        page: "Page",
        investment: "Investment",
        document: "Document",
        profile: "Profile",
        notification: "Notification",
    };
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${styles[type] || "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400"}`}>
            {labels[type] || type}
        </span>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const Search = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inputRef = useRef(null);

    const initialQuery = searchParams.get("q") || "";
    const [query, setQuery] = useState(initialQuery);
    const [activeCategory, setActiveCategory] = useState("All");
    const [results, setResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isFocused, setIsFocused] = useState(false);

    // Load recent searches from localStorage
    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
            setRecentSearches(stored);
        } catch { /* ignore */ }
    }, []);

    // Auto-focus the input
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Run search whenever query or category changes
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        const lower = query.toLowerCase();
        const typeFilter = CATEGORY_MAP[activeCategory];

        const filtered = SEARCH_DATA.filter((item) => {
            const matchesText =
                item.label.toLowerCase().includes(lower) ||
                item.desc.toLowerCase().includes(lower) ||
                item.type.toLowerCase().includes(lower);
            const matchesType = !typeFilter || item.type === typeFilter;
            return matchesText && matchesType;
        });

        setResults(filtered);
    }, [query, activeCategory]);

    const saveRecentSearch = (text) => {
        const updated = [text, ...recentSearches.filter((s) => s !== text)].slice(0, MAX_RECENT);
        setRecentSearches(updated);
        try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
    };

    const handleResultClick = (item) => {
        saveRecentSearch(query.trim());
        navigate(item.path);
    };

    const handleRecentClick = (text) => {
        setQuery(text);
        inputRef.current?.focus();
    };

    const clearQuery = () => {
        setQuery("");
        setResults([]);
        inputRef.current?.focus();
    };

    const clearRecent = () => {
        setRecentSearches([]);
        try { localStorage.removeItem(RECENT_SEARCHES_KEY); } catch { /* ignore */ }
    };

    const showEmpty = query.trim() && results.length === 0;
    const showResults = query.trim() && results.length > 0;
    const showRecent = !query.trim() && recentSearches.length > 0;
    const showSuggestions = !query.trim();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#0f172a] dark:via-[#080c14] dark:to-[#03050a] px-4 py-10 md:py-16">
            <div className="max-w-5xl mx-auto">

                {/* ── Header ── */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-[#2c3f5a]/10 text-[#2c3f5a] dark:bg-sky-500/10 dark:text-sky-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                        <Sparkles className="w-3.5 h-3.5" />
                        Smart Search
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                        Find Anything, Instantly
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                        Search across investments, documents, notifications &amp; more.
                    </p>
                </div>

                {/* ── Search Input ── */}
                <div className={`relative flex items-center bg-white dark:bg-slate-900/80 rounded-2xl border-2 shadow-lg transition-all duration-300 ${
                    isFocused 
                        ? "border-[#2c3f5a] shadow-[#2c3f5a]/10 shadow-xl dark:border-sky-500 dark:shadow-sky-500/10" 
                        : "border-gray-200 dark:border-slate-800"
                }`}>
                    <SearchIcon className="absolute left-5 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && results.length > 0) handleResultClick(results[0]);
                            if (e.key === "Escape") clearQuery();
                        }}
                        placeholder="Search investments, documents, profile…"
                        className="w-full pl-14 pr-14 py-4 md:py-5 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-[15px] md:text-base font-medium focus:outline-none rounded-2xl"
                    />
                    {query && (
                        <button
                            onClick={clearQuery}
                            className="absolute right-5 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-gray-400 transition cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* ── Category Filters ── */}
                <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                    <SlidersHorizontal className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                                activeCategory === cat
                                    ? "bg-[#2c3f5a] text-white border-[#2c3f5a] shadow-sm dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-[#2c3f5a] hover:text-[#2c3f5a] dark:bg-slate-900 dark:text-gray-300 dark:border-slate-800 dark:hover:border-sky-400 dark:hover:text-sky-400"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* ── Results Count ── */}
                {showResults && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 font-medium">
                        Found <span className="font-bold text-[#2c3f5a] dark:text-sky-400">{results.length}</span> result{results.length !== 1 ? "s" : ""} for "<span className="italic">{query}</span>"
                    </p>
                )}

                {/* ── Results List ── */}
                {showResults && (
                    <div className="mt-3 space-y-2">
                        {results.map((item, idx) => (
                            <button
                                key={item.id}
                                onClick={() => handleResultClick(item)}
                                className="w-full flex items-center gap-4 bg-white dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800/80 hover:border-[#2c3f5a]/30 dark:hover:border-sky-500/30 hover:shadow-md rounded-xl p-4 text-left transition-all duration-200 group cursor-pointer"
                                style={{ animationDelay: `${idx * 40}ms` }}
                            >
                                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                                    item.type === "page" ? "bg-[#2c3f5a]/10 dark:bg-sky-500/10" :
                                    item.type === "investment" ? "bg-emerald-50 dark:bg-emerald-950/30" :
                                    item.type === "document" ? "bg-amber-50 dark:bg-amber-950/30" :
                                    item.type === "profile" ? "bg-purple-50 dark:bg-purple-950/30" :
                                    item.type === "notification" ? "bg-rose-50 dark:bg-rose-950/30" : "bg-gray-50 dark:bg-slate-800"
                                }`}>
                                    <ResultIcon icon={item.icon} type={item.type} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                            {item.label}
                                        </span>
                                        <TypeBadge type={item.type} />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.desc}</p>
                                </div>

                                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-[#2c3f5a] dark:group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Empty State ── */}
                {showEmpty && (
                    <div className="mt-16 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-900 flex items-center justify-center">
                            <SearchIcon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                        </div>
                        <div>
                            <p className="text-gray-800 dark:text-white font-semibold text-base">No results found</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                Try different keywords or browse a category above.
                            </p>
                        </div>
                        <button
                            onClick={clearQuery}
                            className="mt-2 text-xs font-bold text-[#2c3f5a] dark:text-sky-400 hover:underline cursor-pointer"
                        >
                            Clear search
                        </button>
                    </div>
                )}

                {/* ── Recent Searches ── */}
                {showRecent && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> Recent Searches
                            </h3>
                            <button
                                onClick={clearRecent}
                                className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-medium cursor-pointer"
                            >
                                Clear all
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleRecentClick(s)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-[#2c3f5a] dark:hover:border-sky-400 hover:text-[#2c3f5a] dark:hover:text-sky-400 transition cursor-pointer"
                                >
                                    <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Quick Links (shown when no query) ── */}
                {showSuggestions && (
                    <div className="mt-10">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" /> Quick Links
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                                { label: "My Investments", path: "/user/investments", icon: "chart", type: "investment", desc: "View portfolio" },
                                { label: "Documents", path: "/user/documents", icon: "file", type: "document", desc: "Manage files" },
                                { label: "Notifications", path: "/user/notifications", icon: "bell", type: "notification", desc: "View alerts" },
                                { label: "My Profile", path: "/user/profile", icon: "user", type: "profile", desc: "Edit details" },
                                { label: "KYC Status", path: "/user/profile", icon: "file", type: "document", desc: "Check KYC" },
                                { label: "Home", path: "/user/home", icon: "home", type: "page", desc: "Dashboard" },
                            ].map((item) => (
                                <button
                                    key={item.path + item.label}
                                    onClick={() => navigate(item.path)}
                                    className="flex items-center gap-3 bg-white dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800/80 hover:border-[#2c3f5a]/30 dark:hover:border-sky-500/30 hover:shadow-sm rounded-xl p-3.5 text-left transition-all group cursor-pointer"
                                >
                                    <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${
                                        item.type === "investment" ? "bg-emerald-50 dark:bg-emerald-950/30" :
                                        item.type === "document" ? "bg-amber-50 dark:bg-amber-950/30" :
                                        item.type === "notification" ? "bg-rose-50 dark:bg-rose-950/30" :
                                        item.type === "profile" ? "bg-purple-50 dark:bg-purple-950/30" : "bg-[#2c3f5a]/10 dark:bg-sky-500/10"
                                    }`}>
                                        <ResultIcon icon={item.icon} type={item.type} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-[#2c3f5a] dark:group-hover:text-sky-400 transition">{item.label}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{item.desc}</p>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-[#2c3f5a] dark:group-hover:text-sky-400 ml-auto shrink-0 group-hover:translate-x-0.5 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
