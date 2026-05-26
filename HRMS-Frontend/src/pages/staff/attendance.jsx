import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clock, LogIn, LogOut, CheckCircle2, XCircle, AlertCircle, Calendar, Filter, Loader2 } from "lucide-react";
import { fetchAttendance, checkInEmployee, checkOutEmployee } from "../../redux/slices/attendanceSlice";

export const StaffAttendance = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { records, loading } = useSelector((state) => state.attendance);

    const [monthFilter, setMonthFilter] = useState("Current Month");
    const [dateFilter, setDateFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Fetch user attendance logs on load
    useEffect(() => {
        if (user?._id) {
            dispatch(fetchAttendance({ employeeId: user._id }));
        }
    }, [dispatch, user]);

    // Live clock logic
    const [currentTime, setCurrentTime] = useState("");
    const [currentDateStr, setCurrentDateStr] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            setCurrentDateStr(now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Filter logs based on UI filter selections
    const filteredLogs = useMemo(() => {
        return records.filter(log => {
            const matchesStatus = statusFilter === "All" || 
                                 (log.status || "").toLowerCase() === statusFilter.toLowerCase();
            
            const logDate = log.date ? new Date(log.date).toISOString().split('T')[0] : "";
            const matchesDate = dateFilter === "" || logDate === dateFilter;

            return matchesStatus && matchesDate;
        });
    }, [records, statusFilter, dateFilter]);

    // Monthly summary stats
    const stats = useMemo(() => {
        const result = { present: 0, absent: 0, halfDay: 0, late: 0 };
        records.forEach(r => {
            const status = (r.status || "").toLowerCase();
            if (status === "present") result.present++;
            else if (status === "absent") result.absent++;
            else if (status === "half-day") result.halfDay++;
            
            // Check if late (e.g. check in after 09:15 AM)
            if (r.checkIn) {
                const parts = r.checkIn.split(":");
                if (parts.length > 0) {
                    const hour = parseInt(parts[0], 10);
                    const minute = parseInt(parts[1]?.substring(0, 2), 10);
                    const isPm = r.checkIn.toLowerCase().includes("pm");
                    if (isPm && hour !== 12) {
                        result.late++;
                    } else if (!isPm && (hour > 9 || (hour === 9 && minute > 15))) {
                        result.late++;
                    }
                }
            }
        });
        return result;
    }, [records]);

    // Today's check-in / out record status
    const todayRecord = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return records.find(r => r.date && new Date(r.date).toISOString().split('T')[0] === todayStr);
    }, [records]);

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
            dispatch(fetchAttendance({ employeeId: user._id }));
        }).catch(err => {
            alert("Error checking in: " + err);
        });
    };

    const handleCheckOut = () => {
        if (!user?._id) return;
        const now = new Date();
        const checkOutTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        dispatch(checkOutEmployee({
            employeeId: user._id,
            checkOutTime
        })).unwrap().then(() => {
            alert("Checked out successfully!");
            dispatch(fetchAttendance({ employeeId: user._id }));
        }).catch(err => {
            alert("Error checking out: " + err);
        });
    };

    const getStatusBadge = (status) => {
        const normalized = status ? status.toLowerCase() : "";
        switch (normalized) {
            case "present":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle2 className="w-3 h-3" /> Present</span>;
            case "late":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" /> Late</span>;
            case "half-day":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20"><Clock className="w-3 h-3" /> Half Day</span>;
            case "absent":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3" /> Absent</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-500/10 text-gray-400 border border-gray-500/20">{status}</span>;
        }
    };

    const calculateWorkingHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return "-";
        try {
            const parseTime = (tStr) => {
                const parts = tStr.split(":");
                let hr = parseInt(parts[0], 10);
                const min = parseInt(parts[1]?.substring(0, 2), 10);
                const isPm = tStr.toLowerCase().includes("pm");
                if (isPm && hr !== 12) hr += 12;
                if (!isPm && hr === 12) hr = 0;
                return hr * 60 + min;
            };
            const inMins = parseTime(checkIn);
            const outMins = parseTime(checkOut);
            const diff = outMins - inMins;
            if (diff <= 0) return "-";
            const h = Math.floor(diff / 60);
            const m = diff % 60;
            return `${h}h ${m}m`;
        } catch (e) {
            return "-";
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">My Attendance</h1>
                    <p className="text-sm text-gray-400 mt-1">Clock in/out, view your work hours, and track attendance history.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Clock Actions & Summary */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Live Clock Card */}
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col items-center p-8 text-center relative group">
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
                        
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider relative z-10 mb-1">Current Time</h2>
                        <div className="text-4xl font-black text-white font-mono tracking-tighter relative z-10">{currentTime}</div>
                        <p className="text-sm text-gray-500 mt-1 font-medium relative z-10">{currentDateStr}</p>

                        <div className="w-full flex gap-3 mt-8 relative z-10">
                            <button 
                                onClick={handleCheckIn}
                                disabled={!!todayRecord}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all shadow-lg flex flex-col items-center justify-center gap-1 group-hover:-translate-y-1 cursor-pointer ${
                                    todayRecord 
                                        ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700" 
                                        : "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20"
                                }`}
                            >
                                <LogIn className="w-5 h-5 mb-1" /> Check In
                            </button>
                            <button 
                                onClick={handleCheckOut}
                                disabled={!todayRecord || !!todayRecord.checkOut}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 group-hover:-translate-y-1 cursor-pointer ${
                                    !todayRecord || todayRecord.checkOut 
                                        ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700" 
                                        : "bg-red-500 hover:bg-red-600 text-white hover:shadow-lg hover:shadow-red-500/20"
                                }`}
                            >
                                <LogOut className="w-5 h-5 mb-1" /> Check Out
                            </button>
                        </div>
                        {todayRecord && (
                            <p className="text-xs text-blue-400 mt-3 font-semibold relative z-10">
                                Checked In: {todayRecord.checkIn} {todayRecord.checkOut ? `| Checked Out: ${todayRecord.checkOut}` : ""}
                            </p>
                        )}
                    </div>

                    {/* Monthly Summary */}
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-[#111111] px-6 py-4 border-b border-gray-800 flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <h3 className="text-base font-bold text-white">Attendance Summary</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                                <div className="text-2xl font-bold text-green-400">{stats.present}</div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mt-1">Present</div>
                            </div>
                            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                                <div className="text-2xl font-bold text-red-400">{stats.absent}</div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mt-1">Absent</div>
                            </div>
                            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                                <div className="text-2xl font-bold text-blue-400">{stats.halfDay}</div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mt-1">Half Days</div>
                            </div>
                            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                                <div className="text-2xl font-bold text-amber-400">{stats.late}</div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mt-1">Late</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Attendance Log Table */}
                <div className="lg:col-span-8 flex flex-col h-full">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
                        
                        {/* Filters Bar */}
                        <div className="p-5 border-b border-gray-800 bg-[#111111] flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-500" /> Attendance Log
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                <div className="relative w-full sm:w-auto">
                                    <input 
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Filter className="w-4 h-4 text-gray-500 hidden sm:block" />
                                    <select 
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full sm:w-auto bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Present">Present</option>
                                        <option value="Absent">Absent</option>
                                        <option value="Half-day">Half Day</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-500 border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-center">Check In</th>
                                        <th className="px-6 py-4 text-center">Check Out</th>
                                        <th className="px-6 py-4 text-center">Working Hours</th>
                                        <th className="px-6 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-16 text-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                                                <span className="text-sm text-gray-500 block mt-2">Loading attendance logs...</span>
                                            </td>
                                        </tr>
                                    ) : filteredLogs.length > 0 ? filteredLogs.map((log) => {
                                        const formattedDate = log.date ? new Date(log.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "—";
                                        return (
                                            <tr key={log._id} className="hover:bg-[#1a1a1a] transition-colors group">
                                                <td className="px-6 py-4 font-medium text-gray-200">
                                                    {formattedDate}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-center text-gray-300">
                                                    {log.checkIn || "—"}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-center text-gray-300">
                                                    {log.checkOut || "—"}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-center font-bold text-blue-400">
                                                    {calculateWorkingHours(log.checkIn, log.checkOut)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {getStatusBadge(log.status)}
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                No attendance records found matching your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
