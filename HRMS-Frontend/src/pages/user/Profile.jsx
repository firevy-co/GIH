import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Phone, Lock, UploadCloud, Check, Camera, Image as ImageIcon, Briefcase, FileText, AlertCircle, Fingerprint, ShieldCheck, Sun, Moon } from "lucide-react";
import { updateProfile, checkAuth } from "../../redux/slices/authSlice";
import axios from "axios";

export const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    // Theme State
    const [theme, setTheme] = useState(() => localStorage.getItem("user-theme") || "light");

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem("user-theme", newTheme);
        window.dispatchEvent(new Event("user-theme-changed"));
    };

    // Profile State (Editable)
    const [profileData, setProfileData] = useState({
        name: "",
        phone: "",
    });

    const [profileImage, setProfileImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // Cover Photo State
    const [coverPhoto, setCoverPhoto] = useState(() => localStorage.getItem("user-cover-photo") || "");
    const [isEditingCover, setIsEditingCover] = useState(false);
    const coverInputRef = useRef(null);

    // Predefined banners matching Admin and Staff
    const predefinedBanners = [
        { name: "Modern Cityscape", value: "/skyscraper_cta.png" },
        { name: "Financial Growth", value: "/coin_stack.png" },
        { name: "Digital Solutions", value: "/smart_solutions.png" },
        { name: "Abstract Art", value: "/art_museum.png" }
    ];

    const selectPredefinedCover = (value) => {
        setCoverPhoto(value);
        localStorage.setItem("user-cover-photo", value);
        setIsEditingCover(false);
    };

    const removeCoverPhoto = () => {
        setCoverPhoto("");
        localStorage.removeItem("user-cover-photo");
        setIsEditingCover(false);
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setCoverPhoto(base64String);
                localStorage.setItem("user-cover-photo", base64String);
                setIsEditingCover(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerCoverInput = () => {
        if (coverInputRef.current) {
            coverInputRef.current.click();
        }
    };

    // Password State
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // KYC State
    const [kycFile, setKycFile] = useState(null);
    const [kycUploadSuccess, setKycUploadSuccess] = useState(false);
    const [isKycUploading, setIsKycUploading] = useState(false);
    const [kycError, setKycError] = useState("");
    const kycInputRef = useRef(null);

    // Sync state with logged-in user
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || "",
                phone: user.phone || "",
            });
            if (user.profilePicture) {
                const isFullUrl = user.profilePicture.startsWith("http");
                setProfileImage(isFullUrl ? user.profilePicture : `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "")}${user.profilePicture}`);
            }
        }
    }, [user]);

    // Save Profile & Password Changes
    const handleSave = (e) => {
        e.preventDefault();

        if (passwords.new && passwords.new !== passwords.confirm) {
            alert("New password and confirm password do not match!");
            return;
        }

        setIsSaving(true);

        const formData = new FormData();
        formData.append("name", profileData.name);
        formData.append("phone", profileData.phone);

        if (selectedFile) {
            formData.append("profilePicture", selectedFile);
        }

        if (passwords.current && passwords.new) {
            formData.append("currentPassword", passwords.current);
            formData.append("newPassword", passwords.new);
        }

        dispatch(updateProfile(formData))
            .unwrap()
            .then(() => {
                setIsSaving(false);
                setSaved(true);
                setPasswords({ current: "", new: "", confirm: "" });
                setSelectedFile(null);
                setTimeout(() => setSaved(false), 3000);
            })
            .catch((err) => {
                setIsSaving(false);
                alert("Error updating profile: " + err);
            });
    };

    // Profile picture picker
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // KYC File Selector
    const handleKycFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setKycFile(file);
            setKycError("");
            setKycUploadSuccess(false);
        }
    };

    const triggerKycInput = () => {
        if (kycInputRef.current) {
            kycInputRef.current.click();
        }
    };

    // KYC Upload Handlers
    const handleKycUpload = async (e) => {
        e.preventDefault();
        if (!kycFile) {
            setKycError("Please select a file to upload.");
            return;
        }

        setIsKycUploading(true);
        setKycError("");
        setKycUploadSuccess(false);

        const formData = new FormData();
        formData.append("kyc", kycFile);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/users/upload-kyc`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.data.success) {
                setKycUploadSuccess(true);
                setKycFile(null);
                // Sync user session to reflect new KYC pending status immediately
                dispatch(checkAuth());
            } else {
                setKycError(response.data.message || "KYC upload failed.");
            }
        } catch (err) {
            console.error("KYC upload error:", err);
            setKycError(err.response?.data?.message || "Error uploading KYC document.");
        } finally {
            setIsKycUploading(false);
        }
    };

    // Resolve current KYC Badge colors
    const getKycBadge = (status) => {
        const normalized = status ? status.toLowerCase() : "unverified";
        switch (normalized) {
            case "verified":
                return (
                    <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Verified
                    </span>
                );
            case "pending":
                return (
                    <span className="px-3.5 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 animate-pulse" /> Pending Approval
                    </span>
                );
            case "rejected":
                return (
                    <span className="px-3.5 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="px-3.5 py-1.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5" /> Unverified
                    </span>
                );
        }
    };

    return (
        <div className="w-full text-gray-900 font-sans p-6 md:p-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-[1400px] mx-auto space-y-8">

                {/* Profile Banner Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

                    {/* Banner cover input */}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={coverInputRef}
                        onChange={handleCoverChange}
                    />

                    {/* Header Banner */}
                    <div
                        onClick={() => setIsEditingCover(true)}
                        className="h-52 w-full relative group cursor-pointer border-b border-gray-200 overflow-hidden"
                    >
                        {coverPhoto ? (
                            <img src={coverPhoto} alt="Cover Banner" className="w-full h-full object-cover animate-in fade-in duration-300" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-[#2c3f5a]/30 via-slate-100 to-[#364968]/20" />
                        )}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                                <ImageIcon className="w-4 h-4 text-[#2c3f5a]" /> Change Cover Photo
                            </span>
                        </div>

                        {/* Banner Selector Popover */}
                        {isEditingCover && (
                            <div
                                className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-gray-800 text-xs font-bold mb-3 uppercase tracking-wider">Choose Banner Style</h3>

                                {/* Predefined Banners Grid */}
                                <div className="flex items-center gap-3 mb-4">
                                    {predefinedBanners.map((banner, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => selectPredefinedCover(banner.value)}
                                            style={{
                                                backgroundImage: `url(${banner.value})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                            className="w-16 h-12 rounded-xl border border-gray-200 hover:scale-110 transition-transform cursor-pointer focus:outline-none shadow-sm hover:shadow"
                                            title={banner.name}
                                        />
                                    ))}
                                </div>

                                {/* Banner Actions */}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={triggerCoverInput}
                                        className="bg-[#2c3f5a] hover:bg-[#1a2636] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-none"
                                    >
                                        <UploadCloud className="w-3.5 h-3.5" /> Upload Cover File
                                    </button>

                                    {coverPhoto && (
                                        <button
                                            type="button"
                                            onClick={removeCoverPhoto}
                                            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                                        >
                                            Reset Default
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setIsEditingCover(false)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Information Row */}
                    <div className="px-6 md:px-12 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-14 relative z-10">
                        {/* Avatar Upload Container */}
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                            />
                            <div
                                onClick={triggerFileInput}
                                className="w-28 h-28 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden relative cursor-pointer"
                            >
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black text-gray-400 group-hover:opacity-0 transition-opacity">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                                    </span>
                                )}
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white mb-1" />
                                    <span className="text-[9px] font-bold text-white uppercase tracking-widest">Update</span>
                                </div>
                            </div>
                            <div
                                onClick={triggerFileInput}
                                className="absolute bottom-1 right-0 w-8 h-8 bg-[#2c3f5a] rounded-full border-4 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow"
                            >
                                <Camera className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>

                        {/* Title and Metadata */}
                        <div className="text-center md:text-left flex-1 pb-1">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{user?.name || "Loading name..."}</h1>
                            <p className="text-gray-500 text-sm mt-0.5 font-medium">{user?.email}</p>
                        </div>

                        {/* Badges Container */}
                        <div className="flex flex-wrap items-center gap-3 pb-1.5">
                            <div className="px-3.5 py-1.5 bg-[#eff2f6] border border-gray-200 rounded-full inline-flex items-center gap-1.5 text-gray-700 text-xs font-bold uppercase tracking-wider">
                                <Briefcase className="w-3.5 h-3.5 text-[#2c3f5a]" /> {user?.role || "Client"}
                            </div>
                            {getKycBadge(user?.kycStatus)}
                        </div>
                    </div>
                </div>

                {/* Forms grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column Forms (Unified Save) */}
                    <form onSubmit={handleSave} className="space-y-8 flex flex-col">

                        {/* Personal Details Card */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                            <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#2c3f5a]/10 flex items-center justify-center text-[#2c3f5a]">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-md font-bold text-gray-900">Personal Information</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Manage your personal settings.</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-5 flex-1">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-[#2c3f5a] focus:ring-1 focus:ring-[#2c3f5a] transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-[#2c3f5a] focus:ring-1 focus:ring-[#2c3f5a] transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            disabled
                                            value={user?.email || ""}
                                            className="w-full bg-gray-100 border border-gray-200 text-gray-500 text-sm rounded-xl pl-11 pr-4 py-3 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Credentials Card */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                            <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-650">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-md font-bold text-gray-900">Security & Password</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Ensure your account remains secure.</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-gray-800 focus:ring-1 focus:ring-gray-800 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 my-2 pt-2" />

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-[#2c3f5a] focus:ring-1 focus:ring-[#2c3f5a] transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-[#2c3f5a] focus:ring-1 focus:ring-[#2c3f5a] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Trigger Button */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-[#2c3f5a] hover:bg-[#1a2636] text-white px-8 py-3.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-[#2c3f5a]/10 flex items-center justify-center gap-2.5 disabled:opacity-75 min-w-[200px] cursor-pointer"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : saved ? (
                                    <><Check className="w-4 h-4" /> Saved Successfully</>
                                ) : (
                                    "Save Settings & Security"
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Right Column: KYC Verification & Account Info */}
                    <div className="space-y-8 flex flex-col h-full">

                        {/* Theme Preference Card */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
                            <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    {theme === "light" ? <Sun className="w-5 h-5 animate-spin-slow" /> : <Moon className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h2 className="text-md font-bold text-[#2c3f5a] dark:text-sky-400">Theme Preference</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Choose your preferred style for the interface.</p>
                                </div>
                            </div>
                            <div className="p-8 flex items-center justify-between gap-4">
                                <span className="text-sm font-semibold text-gray-700">Display Theme</span>
                                <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl border border-gray-200 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleThemeChange("light")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            theme === "light"
                                                ? "bg-white text-[#2c3f5a] shadow-sm"
                                                : "text-gray-500 hover:text-gray-800"
                                        }`}
                                    >
                                        <Sun className="w-3.5 h-3.5" /> Light
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleThemeChange("dark")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            theme === "dark"
                                                ? "bg-[#2c3f5a] text-white shadow-sm"
                                                : "text-gray-500 hover:text-gray-800"
                                        }`}
                                    >
                                        <Moon className="w-3.5 h-3.5" /> Dark
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* KYC Verification Module */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                            <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#2c3f5a]">
                                    <Fingerprint className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-md font-bold text-gray-900">KYC Identity Verification</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Required for fully unlocking investment options.</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-6 flex-1 flex flex-col">
                                {/* KYC status banner */}
                                <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${user?.kycStatus?.toLowerCase() === "verified" ? "bg-emerald-50/50 border-emerald-100 text-emerald-800" :
                                        user?.kycStatus?.toLowerCase() === "pending" ? "bg-amber-50/50 border-amber-100 text-amber-800" :
                                            user?.kycStatus?.toLowerCase() === "rejected" ? "bg-rose-50/50 border-rose-100 text-rose-800" :
                                                "bg-blue-50/30 border-blue-100 text-slate-800"
                                    }`}>
                                    <Fingerprint className={`w-5 h-5 shrink-0 ${user?.kycStatus?.toLowerCase() === "verified" ? "text-emerald-500" :
                                            user?.kycStatus?.toLowerCase() === "pending" ? "text-amber-500" :
                                                user?.kycStatus?.toLowerCase() === "rejected" ? "text-rose-500" :
                                                    "text-[#2c3f5a]"
                                        }`} />
                                    <div className="text-sm">
                                        <p className="font-bold flex items-center gap-2">
                                            Status: <span className="capitalize">{user?.kycStatus || "Not Verified"}</span>
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                            {user?.kycStatus?.toLowerCase() === "verified" && "Your identity verification is approved. You have full access to investment opportunities and transactions."}
                                            {user?.kycStatus?.toLowerCase() === "pending" && "Your KYC documents are currently being audited by our administrators. This usually takes 24-48 hours."}
                                            {user?.kycStatus?.toLowerCase() === "rejected" && "Your verification document was rejected. Please upload a clear document (PDF, Passport, Utility bill) and submit again."}
                                            {!user?.kycStatus && "To comply with international financial regulations, please upload a valid government-issued ID (Passport, National ID Card, or Driver's license) to verify your account."}
                                        </p>
                                    </div>
                                </div>

                                {user?.kycUrl && (
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">Uploaded Document</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[200px]">
                                                    {user.kycUrl.split("/").pop()}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={`${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "")}${user.kycUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-[#2c3f5a] hover:underline"
                                        >
                                            View Document
                                        </a>
                                    </div>
                                )}

                                {/* Upload Section */}
                                {(!user?.kycStatus || user.kycStatus === "rejected" || user.kycStatus === "pending") && (
                                    <form onSubmit={handleKycUpload} className="space-y-4 pt-2">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Upload Identity Document
                                        </h3>

                                        <input
                                            type="file"
                                            accept=".pdf,image/*"
                                            className="hidden"
                                            ref={kycInputRef}
                                            onChange={handleKycFileChange}
                                        />

                                        <div
                                            onClick={triggerKycInput}
                                            className="border-2 border-dashed border-gray-300 hover:border-[#2c3f5a] rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50 hover:bg-[#eff2f6]/30 flex flex-col items-center justify-center group"
                                        >
                                            <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-[#2c3f5a] group-hover:scale-110 transition-all duration-300 mb-2" />

                                            {kycFile ? (
                                                <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                                                    <FileText className="w-4 h-4 text-emerald-500" /> {kycFile.name}
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-sm font-bold text-gray-700">Click to upload document</p>
                                                    <p className="text-xs text-gray-500 mt-1">Supports PDF, JPEG, or PNG (Max 5MB)</p>
                                                </>
                                            )}
                                        </div>

                                        {kycError && (
                                            <p className="text-xs font-bold text-red-650 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" /> {kycError}
                                            </p>
                                        )}

                                        {kycUploadSuccess && (
                                            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                <Check className="w-3.5 h-3.5" /> KYC document uploaded and pending approval successfully!
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isKycUploading || !kycFile}
                                            className="w-full bg-[#2c3f5a] hover:bg-[#1a2636] text-white py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            {isKycUploading ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-4 h-4" /> Upload & Submit Verification
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Financial Account Info Card */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                            <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-md font-bold text-gray-900">Security & KYC Policies</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Understand our privacy and security measures.</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-4 text-xs text-gray-600 leading-relaxed flex-1">
                                <p>
                                    <strong>1. Multi-factor Auditing:</strong> All sensitive profile adjustments (password changes, phone number alterations) go through secure sessions.
                                </p>
                                <p>
                                    <strong>2. KYC Audit Protocol:</strong> We enforce strict anti-money laundering regulations. Accounts that fail to complete verification may experience restrictions in their total transaction limit or document signatures.
                                </p>
                                <p>
                                    <strong>3. Data Privacy:</strong> Uploaded identity records are encrypted and securely stored. Only authenticated HRMS / Compliance administrators are allowed to audit details.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};