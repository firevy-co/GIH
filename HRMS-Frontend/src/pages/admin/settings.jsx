import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, Settings, UploadCloud, Mail, Phone, MapPin, Shield, Bell, Wrench, Save, Check, MoreVertical, Sun, Moon } from "lucide-react";
import { fetchSettings, saveSettings } from "../../redux/slices/settingSlice";

export const AdminSettings = () => {
    const dispatch = useDispatch();
    const { settings, loading } = useSelector((state) => state.settings);

    // Horizontal Tabs State
    const [activeTab, setActiveTab] = useState("company");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const logoInputRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        // wait, menuRef is correct here
        const handleOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    // Company Settings State
    const [companyData, setCompanyData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "123 Business Avenue, Suite 100, New York, NY 10001"
    });

    const [logoPreview, setLogoPreview] = useState("");
    const [selectedLogoFile, setSelectedLogoFile] = useState(null);

    // System Settings State
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [smsAlerts, setSmsAlerts] = useState(false);
    const [autoBackup, setAutoBackup] = useState(true);

    // Feedback State
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Theme State
    const [adminTheme, setAdminTheme] = useState(() => localStorage.getItem("admin-theme") || "dark");

    const handleThemeChange = (newTheme) => {
        setAdminTheme(newTheme);
        localStorage.setItem("admin-theme", newTheme);
        window.dispatchEvent(new Event("admin-theme-changed"));
    };

    // Fetch settings on load
    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    // Sync state with dynamic backend settings
    useEffect(() => {
        if (settings) {
            setCompanyData({
                name: settings.companyName || "",
                email: settings.companyEmail || "",
                phone: settings.companyPhone || "",
                address: settings.companyAddress || "123 Business Avenue, Suite 100, New York, NY 10001"
            });
            setMaintenanceMode(!!settings.maintenanceMode);
            if (settings.websiteLogo) {
                const isFullUrl = settings.websiteLogo.startsWith("http");
                setLogoPreview(isFullUrl ? settings.websiteLogo : `http://localhost:5000${settings.websiteLogo}`);
            }
        }
    }, [settings]);

    const handleSave = (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        formData.append("companyName", companyData.name);
        formData.append("companyEmail", companyData.email);
        formData.append("companyPhone", companyData.phone);
        formData.append("maintenanceMode", maintenanceMode);
        formData.append("companyAddress", companyData.address);

        if (selectedLogoFile) {
            formData.append("logo", selectedLogoFile);
        }

        dispatch(saveSettings(formData))
            .unwrap()
            .then(() => {
                setIsSaving(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            })
            .catch((err) => {
                setIsSaving(false);
                alert("Error saving settings: " + err);
            });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const triggerLogoInput = () => {
        if (logoInputRef.current) {
            logoInputRef.current.click();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
                    <p className="text-sm text-gray-400 mt-1">Configure company profiles, system preferences, and platform roles.</p>
                </div>

                <div className="flex items-center gap-3 relative" ref={menuRef}>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : saved ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">{saved ? "Saved Successfully" : "Save All Changes"}</span>
                        <span className="sm:hidden">{saved ? "Saved" : "Save"}</span>
                    </button>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${isMenuOpen ? "bg-gray-800 border-gray-700 text-white" : "bg-[#1a1a1a] border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800"
                            }`}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* 3 Dots Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-1">
                                <button
                                    onClick={() => { setActiveTab("company"); setIsMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "company" ? "bg-orange-500/10 text-orange-400" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                        }`}
                                >
                                    <Building2 className="w-4 h-4" /> Company Profile
                                </button>
                                <button
                                    onClick={() => { setActiveTab("system"); setIsMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "system" ? "bg-orange-500/10 text-orange-400" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                        }`}
                                >
                                    <Settings className="w-4 h-4" /> System Config
                                </button>
                                <button
                                    onClick={() => { setActiveTab("roles"); setIsMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === "roles" ? "bg-orange-500/10 text-orange-400" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                        }`}
                                >
                                    <Shield className="w-4 h-4" /> Roles & Access
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-lg w-full">

                {/* 1. Company Profile Tab */}
                {activeTab === "company" && (
                    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
                        {/* Logo Upload (Horizontal Layout) */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-gray-800">
                            <input 
                                type="file" 
                                ref={logoInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleLogoChange}
                            />
                            <div 
                                onClick={triggerLogoInput}
                                className="w-24 h-24 rounded-full bg-[#1a1a1a] border border-gray-700 flex items-center justify-center overflow-hidden shrink-0 group relative cursor-pointer hover:border-orange-500 transition-colors shadow-inner"
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black text-gray-500 group-hover:opacity-0 transition-opacity">HG</span>
                                )}
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <UploadCloud className="w-6 h-6 text-white mb-1" />
                                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">Upload</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-white">Company Logo</h3>
                                <p className="text-sm text-gray-400 mt-1 max-w-xl">
                                    This logo will appear on the main portal, emails, and exported reports. Recommended size: 256x256px (JPG, PNG, SVG).
                                </p>
                            </div>
                            <div>
                                <button 
                                    onClick={triggerLogoInput}
                                    className="bg-gray-800 text-white hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-gray-700 flex items-center gap-2 cursor-pointer"
                                >
                                    <UploadCloud className="w-4 h-4" /> Upload Image
                                </button>
                            </div>
                        </div>

                        {/* Text Inputs (Horizontal Flow) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Company Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={companyData.name}
                                        onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Support Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="email"
                                        value={companyData.email}
                                        onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={companyData.phone}
                                        onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Registered Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <textarea
                                        value={companyData.address}
                                        onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                                        rows="2"
                                        className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. System Settings Tab */}
                {activeTab === "system" && (
                    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">

                        {/* Maintenance Row */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-800">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-red-500" /> Maintenance Mode
                                </h3>
                                <p className="text-sm text-gray-400 mt-1 max-w-2xl">
                                    Enable this to lock out all non-admin users. They will see a "System Under Maintenance" screen until disabled.
                                </p>
                            </div>
                            <button
                                onClick={() => setMaintenanceMode(!maintenanceMode)}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors shrink-0 cursor-pointer ${maintenanceMode ? 'bg-red-500' : 'bg-gray-700'}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-[#1a1a1a] transition-transform ${maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* Theme Preference Row */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-800">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Sun className="w-5 h-5 text-orange-500" /> Admin Panel Theme
                                </h3>
                                <p className="text-sm text-gray-400 mt-1 max-w-2xl">
                                    Toggle between light and dark modes for the administrator portal.
                                </p>
                            </div>
                            <div className="flex items-center bg-[#1a1a1a] border border-gray-800 rounded-lg p-1 shrink-0">
                                <button
                                    onClick={() => handleThemeChange("dark")}
                                    className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                        adminTheme === "dark"
                                            ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                                            : "text-gray-400 hover:text-gray-200"
                                    }`}
                                >
                                    <Moon className="w-3.5 h-3.5" /> Dark
                                </button>
                                <button
                                    onClick={() => handleThemeChange("light")}
                                    className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                        adminTheme === "light"
                                            ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                                            : "text-gray-400 hover:text-gray-200"
                                    }`}
                                >
                                    <Sun className="w-3.5 h-3.5" /> Light
                                </button>
                            </div>
                        </div>

                        {/* Notifications Row */}
                        <div className="space-y-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                                <Bell className="w-5 h-5 text-orange-500" /> Notification Preferences
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 flex flex-col justify-between h-full">
                                    <div>
                                        <p className="text-sm font-bold text-gray-200 mb-1">Global Email Alerts</p>
                                        <p className="text-xs text-gray-500 mb-4">Send summary emails to all users regarding system updates.</p>
                                    </div>
                                    <button
                                        onClick={() => setEmailAlerts(!emailAlerts)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${emailAlerts ? 'bg-green-500' : 'bg-gray-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-[#1a1a1a] transition-transform ${emailAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 flex flex-col justify-between h-full">
                                    <div>
                                        <p className="text-sm font-bold text-gray-200 mb-1">Push SMS Alerts</p>
                                        <p className="text-xs text-gray-500 mb-4">Deliver critical security alerts via SMS to admin phones.</p>
                                    </div>
                                    <button
                                        onClick={() => setSmsAlerts(!smsAlerts)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${smsAlerts ? 'bg-green-500' : 'bg-gray-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-[#1a1a1a] transition-transform ${smsAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 flex flex-col justify-between h-full">
                                    <div>
                                        <p className="text-sm font-bold text-gray-200 mb-1">Automated Backups</p>
                                        <p className="text-xs text-gray-500 mb-4">Run database snapshot backups daily at 00:00 UTC.</p>
                                    </div>
                                    <button
                                        onClick={() => setAutoBackup(!autoBackup)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${autoBackup ? 'bg-green-500' : 'bg-gray-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-[#1a1a1a] transition-transform ${autoBackup ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* 3. Roles & Access Tab */}
                {activeTab === "roles" && (
                    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-800">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-green-500" /> Default Registration Role
                                </h3>
                                <p className="text-sm text-gray-400 mt-1 max-w-2xl">
                                    Determine the initial access level granted when a new user registers on the portal.
                                </p>
                            </div>
                            <div className="w-full md:w-64">
                                <select className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500 cursor-pointer">
                                    <option value="user">Standard User (Investor)</option>
                                    <option value="staff">Internal Staff (HR)</option>
                                    <option value="manager">Manager Level</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h4 className="text-sm font-bold text-white">Advanced Role Matrix</h4>
                                <p className="text-xs text-gray-500 mt-1">Configure granular permissions for specific API endpoints and page access.</p>
                            </div>
                            <button className="bg-gray-800 text-white hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer">
                                Edit Permissions Table
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};