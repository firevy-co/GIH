import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Phone, Lock, UploadCloud, ShieldCheck, Check, Camera, Image as ImageIcon } from "lucide-react";
import { updateProfile } from "../../redux/slices/authSlice";

export const AdminProfile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const [profileImage, setProfileImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // Cover Photo State
    const [coverPhoto, setCoverPhoto] = useState(() => localStorage.getItem("admin-cover-photo") || "");
    const [isEditingCover, setIsEditingCover] = useState(false);
    const coverInputRef = useRef(null);

    const predefinedBanners = [
        { name: "Modern Cityscape", value: "/skyscraper_cta.png" },
        { name: "Financial Growth", value: "/coin_stack.png" },
        { name: "Digital Solutions", value: "/smart_solutions.png" },
        { name: "Abstract Art", value: "/art_museum.png" }
    ];

    const selectPredefinedCover = (value) => {
        setCoverPhoto(value);
        localStorage.setItem("admin-cover-photo", value);
        setIsEditingCover(false);
    };

    const removeCoverPhoto = () => {
        setCoverPhoto("");
        localStorage.removeItem("admin-cover-photo");
        setIsEditingCover(false);
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setCoverPhoto(base64String);
                localStorage.setItem("admin-cover-photo", base64String);
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

    // Sync state with logged-in user
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
            });
            if (user.profilePicture) {
                const isFullUrl = user.profilePicture.startsWith("http");
                setProfileImage(isFullUrl ? user.profilePicture : `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "")}${user.profilePicture}`);
            }
        }
    }, [user]);

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
                setTimeout(() => setSaved(false), 3000);
            })
            .catch((err) => {
                setIsSaving(false);
                alert("Error updating profile: " + err);
            });
    };

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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-6xl mx-auto w-full">
            
            {/* Top Banner & Profile Overview */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
                {/* Cover Photo */}
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={coverInputRef} 
                    onChange={handleCoverChange} 
                />
                <div 
                    onClick={() => setIsEditingCover(true)}
                    className="h-48 w-full relative group cursor-pointer border-b border-gray-800 overflow-hidden"
                >
                    {coverPhoto ? (
                        <img src={coverPhoto} alt="Cover Banner" className="w-full h-full object-cover animate-in fade-in duration-300" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-orange-900/40 via-[#111] to-blue-900/40" />
                    )}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-black/90 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 backdrop-blur-md border border-gray-700">
                            <ImageIcon className="w-4 h-4" /> Change Cover Photo
                        </span>
                    </div>

                    {/* Cover Editor Overlay */}
                    {isEditingCover && (
                        <div className="absolute inset-0 bg-black/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-white text-xs font-bold mb-3 uppercase tracking-wider">Choose Banner Image</h3>
                            
                            {/* Predefined Images Row */}
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
                                        className="w-12 h-12 rounded-lg border border-gray-700 hover:scale-110 transition-transform cursor-pointer focus:outline-none shadow-md"
                                        title={banner.name}
                                    />
                                ))}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={triggerCoverInput}
                                    className="bg-orange-500 hover:bg-orange-400 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-none"
                                >
                                    <UploadCloud className="w-3.5 h-3.5" /> Upload File
                                </button>
                                
                                {coverPhoto && (
                                    <button
                                        type="button"
                                        onClick={removeCoverPhoto}
                                        className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                                    >
                                        Reset Default
                                    </button>
                                )}
                                
                                <button
                                    type="button"
                                    onClick={() => setIsEditingCover(false)}
                                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border border-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Avatar & Info Row */}
                <div className="px-6 sm:px-10 pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 relative">
                    
                    {/* Avatar */}
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
                            className="w-32 h-32 rounded-full bg-[#1a1a1a] border-4 border-[#1a1a1a] shadow-2xl flex items-center justify-center overflow-hidden relative cursor-pointer"
                        >
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-black text-gray-400 group-hover:opacity-0 transition-opacity">
                                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : "A"}
                                </span>
                            )}
                            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white mb-1" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                            </div>
                        </div>
                        <div 
                            onClick={triggerFileInput}
                            className="absolute bottom-2 right-0 w-8 h-8 bg-orange-500 rounded-full border-4 border-[#1a1a1a] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-orange-500/20"
                        >
                            <UploadCloud className="w-3.5 h-3.5 text-white" />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="text-center sm:text-left flex-1 pb-2">
                        <h1 className="text-3xl font-black text-white tracking-tight">{profileData.name || "Loading..."}</h1>
                        <p className="text-gray-400 font-medium mt-1">{profileData.email || "—"}</p>
                    </div>

                    {/* Actions / Badges */}
                    <div className="flex items-center gap-3 pb-3">
                        <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg inline-flex items-center gap-2 text-orange-400 text-sm font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4" /> Super Admin
                        </div>
                    </div>
                </div>
            </div>

            {/* Forms Grid */}
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Personal Information Card */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-xl overflow-hidden flex flex-col">
                    <div className="bg-[#111111] px-8 py-5 border-b border-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Personal Information</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Update your basic profile details.</p>
                        </div>
                    </div>
                    
                    <div className="p-8 space-y-6 flex-1">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input 
                                    type="text" 
                                    required
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-base rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-inner" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input 
                                    type="email" 
                                    disabled
                                    value={profileData.email}
                                    className="w-full bg-gray-800/40 border border-gray-700/50 text-gray-400 text-base rounded-xl pl-12 pr-4 py-3.5 focus:outline-none cursor-not-allowed" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input 
                                    type="text" 
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-base rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-inner" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security & Password Card */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-xl overflow-hidden flex flex-col">
                    <div className="bg-[#111111] px-8 py-5 border-b border-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-red-500/10 flex items-center justify-center text-red-500">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Security & Password</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Ensure your account stays secure.</p>
                        </div>
                    </div>
                    
                    <div className="p-8 space-y-6 flex-1">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-base rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner" 
                                />
                            </div>
                        </div>
                        
                        <hr className="border-gray-800 my-2" />

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-base rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-base rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Width Footer Action */}
                <div className="lg:col-span-2 flex justify-end">
                    <button 
                        type="submit"
                        disabled={isSaving}
                        className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3.5 rounded-xl text-base font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 disabled:opacity-70 min-w-[200px] cursor-pointer"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : saved ? (
                            <><Check className="w-5 h-5" /> Saved Successfully</>
                        ) : (
                            "Save All Changes"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};