import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Clock, FileText, Users, Calendar, LogIn, LogOut, UploadCloud, CalendarPlus, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2 } from "lucide-react";
import { fetchUserDashboard, fetchNotifications } from "../../redux/slices/notificationSlice";
import { fetchDocuments } from "../../redux/slices/documentSlice";
import { checkInEmployee, checkOutEmployee } from "../../redux/slices/attendanceSlice";

export const StaffDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { user } = useSelector((state) => state.auth);
    const { userDashboard, notifications, dashboardLoading } = useSelector((state) => state.notifications);
    const { documents, loading: docsLoading } = useSelector((state) => state.documents);

    useEffect(() => {
        dispatch(fetchUserDashboard());
        dispatch(fetchDocuments());
        dispatch(fetchNotifications());
    }, [dispatch]);

    // Handle Quick Check-In
    const handleCheckIn = () => {
        if (!user?._id) return;
        const now = new Date();
        const checkInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        dispatch(checkInEmployee({
            employeeId: user._id,
            location: "Remote",
            checkInTime
        })).unwrap().then(() => {
            alert("Checked in successfully!");
            dispatch(fetchUserDashboard());
        }).catch(err => {
            alert("Error checking in: " + err);
        });
    };

    // Handle Quick Check-Out
    const handleCheckOut = () => {
        if (!user?._id) return;
        const now = new Date();
        const checkOutTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        dispatch(checkOutEmployee({
            employeeId: user._id,
            checkOutTime
        })).unwrap().then(() => {
            alert("Checked out successfully!");
            dispatch(fetchUserDashboard());
        }).catch(err => {
            alert("Error checking out: " + err);
        });
    };

    // Calculate dynamic stats
    const stats = useMemo(() => {
        if (!userDashboard) {
            return {
                attendance: "Not Checked In",
                pendingDocs: 0,
                assignedUsers: 0,
                leaveBalance: 0
            };
        }
        
        const todayAttendance = userDashboard.todayStatus;
        let attendanceStr = "Not Checked In";
        if (todayAttendance?.checkedIn) {
            attendanceStr = `Checked In (${todayAttendance.checkInTime || ""})`;
            if (todayAttendance.checkOutTime) {
                attendanceStr = `Checked Out (${todayAttendance.checkOutTime})`;
            }
        }

        const leavesInfo = userDashboard.leaves;
        const leaveRemaining = 32 - ((leavesInfo?.approved || 0) + (leavesInfo?.pending || 0));

        return {
            attendance: attendanceStr,
            pendingDocs: userDashboard.documents?.pendingSignature || 0,
            assignedUsers: userDashboard.investments?.count || 0,
            leaveBalance: leaveRemaining >= 0 ? leaveRemaining : 0
        };
    }, [userDashboard]);

    // Get top 3 recent documents
    const recentDocs = useMemo(() => {
        return documents.slice(0, 3);
    }, [documents]);

    // Format Date helper
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Header & Quick Actions */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-gray-800 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {user?.name || "Staff"}!</h1>
                    <p className="text-sm text-gray-400 mt-1">Here is the overview of your daily activities and pending tasks.</p>
                </div>
                
                {/* Quick Actions Bar */}
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <button 
                        onClick={handleCheckIn}
                        disabled={userDashboard?.todayStatus?.checkedIn}
                        className={`flex-1 xl:flex-none px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                            userDashboard?.todayStatus?.checkedIn 
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700" 
                                : "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20"
                        }`}
                    >
                        <LogIn className="w-4 h-4" /> Check In
                    </button>
                    <button 
                        onClick={handleCheckOut}
                        disabled={!userDashboard?.todayStatus?.checkedIn || !!userDashboard?.todayStatus?.checkOutTime}
                        className={`flex-1 xl:flex-none px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                            !userDashboard?.todayStatus?.checkedIn || userDashboard?.todayStatus?.checkOutTime
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                                : "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                        }`}
                    >
                        <LogOut className="w-4 h-4" /> Check Out
                    </button>
                    <button 
                        onClick={() => navigate("/staff/documents")}
                        className="flex-1 xl:flex-none bg-blue-500 hover:bg-blue-400 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                    >
                        <UploadCloud className="w-4 h-4" /> Upload Doc
                    </button>
                    <button 
                        onClick={() => navigate("/staff/leaves")}
                        className="flex-1 xl:flex-none bg-[#1a1a1a] border border-gray-700 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <CalendarPlus className="w-4 h-4" /> Apply Leave
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Attendance Card */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 hover:border-green-500/50 transition-colors group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Attendance</p>
                            <h3 className="text-sm font-bold text-white mt-3 truncate max-w-[180px]">{stats.attendance}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                
                {/* Pending Documents Card */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 hover:border-amber-500/50 transition-colors group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Documents</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{stats.pendingDocs}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Assigned Users Card */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 hover:border-blue-500/50 transition-colors group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Invested Portfolios</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{stats.assignedUsers}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Leave Balance Card */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 hover:border-purple-500/50 transition-colors group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Balance</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{stats.leaveBalance} <span className="text-sm text-gray-500 font-medium ml-1">Days</span></h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Recent Documents & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent Documents Table */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl flex flex-col h-full shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-800">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" /> Recent Documents
                        </h2>
                        <button 
                            onClick={() => navigate("/staff/documents")} 
                            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                        >
                            View All
                        </button>
                    </div>
                    <div className="p-5 overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="text-xs uppercase font-semibold text-gray-500 border-b border-gray-800">
                                <tr>
                                    <th className="pb-3 pr-4">File Name</th>
                                    <th className="pb-3 px-4">Date</th>
                                    <th className="pb-3 pl-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {docsLoading ? (
                                    <tr>
                                        <td colSpan="3" className="py-8 text-center text-gray-500">
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-500" />
                                        </td>
                                    </tr>
                                ) : recentDocs.length > 0 ? recentDocs.map((doc) => (
                                    <tr key={doc._id} className="hover:bg-[#1a1a1a] transition-colors group">
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                                                    <FileSpreadsheet className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors truncate max-w-[150px] sm:max-w-[200px]">{doc.title}</span>
                                                    <span className="text-[10px] text-gray-500 mt-0.5">{doc.documentType}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-mono text-xs">{formatDate(doc.createdAt)}</td>
                                        <td className="py-3 pl-4 text-right">
                                            {doc.signed ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                                                    <CheckCircle2 className="w-3 h-3" /> Signed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="py-6 text-center text-gray-500">
                                            No recent documents found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activities Timeline */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl flex flex-col h-full shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-800">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" /> Recent Activities
                        </h2>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto max-h-[300px]">
                        <div className="relative border-l border-gray-800 ml-3 space-y-6">
                            {dashboardLoading ? (
                                <div className="text-center py-4">
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-500" />
                                </div>
                            ) : notifications.length > 0 ? notifications.slice(0, 4).map((activity) => (
                                <div key={activity._id} className="relative pl-6">
                                    <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-[#1a1a1a] border-2 border-gray-700 ring-4 ring-[#1a1a1a]"></span>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-200">{activity.title}</span>
                                            <span className="text-[11px] text-gray-400 mt-0.5">{activity.message}</span>
                                            <span className="text-[10px] font-medium text-gray-500 mt-1">{formatDate(activity.createdAt)}</span>
                                        </div>
                                        <div className="shrink-0">
                                            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                Update
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                    No recent activities recorded.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
