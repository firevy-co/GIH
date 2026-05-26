import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, UserPlus, Eye, Edit2, Ban, Trash2, X, Briefcase, FileText, Activity, Clock, ShieldCheck, Mail, Phone, Calendar, Filter, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { fetchAttendance, updateAttendance, deleteAttendance } from "../../redux/slices/attendanceSlice";
import { fetchEmployees, createEmployee, deleteEmployee, updateEmployee } from "../../redux/slices/employeeSlice";

export const AdminAttendance = () => {
    const dispatch = useDispatch();
    const { records, loading: attLoading } = useSelector((state) => state.attendance);
    const { employees, loading: empLoading } = useSelector((state) => state.employees);

    const [activeTab, setActiveTab] = useState("Attendance");
    const [empSearchQuery, setEmpSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [attSearchQuery, setAttSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("");

    // Add Employee form state
    const [newEmp, setNewEmp] = useState({ name: "", email: "", phone: "", department: "Engineering", designation: "" });

    useEffect(() => {
        dispatch(fetchAttendance());
        dispatch(fetchEmployees());
    }, [dispatch]);

    const formatDate = (d) => { if (!d) return "—"; return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }); };
    const formatStatus = (s) => { if (!s) return "—"; return s.charAt(0).toUpperCase() + s.slice(1); };

    // Attendance analytics
    const presentCount = useMemo(() => records.filter(r => r.status === "present").length, [records]);
    const absentCount = useMemo(() => records.filter(r => r.status === "absent").length, [records]);

    // Filtering (Employees)
    const filteredEmployees = useMemo(() => employees.filter(emp =>
        (emp.name || "").toLowerCase().includes(empSearchQuery.toLowerCase()) ||
        (emp._id || "").toLowerCase().includes(empSearchQuery.toLowerCase()) ||
        (emp.department || "").toLowerCase().includes(empSearchQuery.toLowerCase())
    ), [employees, empSearchQuery]);

    // Filtering (Attendance)
    const filteredAttendance = useMemo(() => records.filter(log => {
        const empName = log.employeeId?.name || "";
        const empEmail = log.employeeId?.email || "";
        const matchesSearch = empName.toLowerCase().includes(attSearchQuery.toLowerCase()) || empEmail.toLowerCase().includes(attSearchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || log.status === statusFilter.toLowerCase();
        const matchesDate = dateFilter === "" || (log.date && log.date.substring(0, 10) === dateFilter);
        return matchesSearch && matchesStatus && matchesDate;
    }), [records, attSearchQuery, statusFilter, dateFilter]);

    const handleViewProfile = (emp) => setSelectedProfile(emp);

    const handleDeleteEmployee = (id) => {
        if (window.confirm("Delete this employee?")) dispatch(deleteEmployee(id));
    };

    const handleToggleStatus = (emp) => {
        const newStatus = emp.status === "active" ? "inactive" : "active";
        dispatch(updateEmployee({ id: emp._id, data: { status: newStatus } }));
    };

    const handleMarkPresent = (log) => {
        dispatch(updateAttendance({ id: log._id, data: { status: "present", checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } }));
    };

    const handleSaveEmployee = (e) => {
        e.preventDefault();
        if (!newEmp.name || !newEmp.email || !newEmp.department || !newEmp.designation) { alert("Fill all required fields"); return; }
        dispatch(createEmployee(newEmp));
        setIsAddModalOpen(false);
        setNewEmp({ name: "", email: "", phone: "", department: "Engineering", designation: "" });
    };

    const handleDeleteAttendance = (id) => {
        if (window.confirm("Delete this attendance record?")) dispatch(deleteAttendance(id));
    };

    return (
        <div className="space-y-6">
            {/* Header & Tabs */}
            <div className="flex flex-col gap-5 border-b border-gray-800 pb-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">HR & Attendance</h1>
                        <p className="text-sm text-gray-400 mt-1">Manage employee records and track daily staff attendance.</p>
                    </div>
                    {activeTab === "Employees" && (
                        <button onClick={() => setIsAddModalOpen(true)} className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-orange-500/20 flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Add Employee
                        </button>
                    )}
                </div>
                <div className="flex gap-6">
                    <button onClick={() => setActiveTab("Attendance")} className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "Attendance" ? "text-orange-400" : "text-gray-500 hover:text-gray-300"}`}>
                        Attendance Log
                        {activeTab === "Attendance" && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-orange-500 rounded-t-full"></span>}
                    </button>
                    <button onClick={() => setActiveTab("Employees")} className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "Employees" ? "text-orange-400" : "text-gray-500 hover:text-gray-300"}`}>
                        Employee Directory
                        {activeTab === "Employees" && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-orange-500 rounded-t-full"></span>}
                    </button>
                </div>
            </div>

            {/* ATTENDANCE TAB */}
            {activeTab === "Attendance" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0"><Clock className="w-6 h-6" /></div>
                            <div><p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total Records</p><h3 className="text-2xl font-bold text-white mt-1">{records.length}</h3></div>
                        </div>
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0"><CheckCircle className="w-6 h-6" /></div>
                            <div><p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Present</p><h3 className="text-2xl font-bold text-white mt-1">{presentCount}</h3></div>
                        </div>
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0"><XCircle className="w-6 h-6" /></div>
                            <div><p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Absent</p><h3 className="text-2xl font-bold text-white mt-1">{absentCount}</h3></div>
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                            <input type="text" placeholder="Search Employee Name..." value={attSearchQuery} onChange={(e) => setAttSearchQuery(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-orange-500 transition-all" />
                        </div>
                        <div className="flex w-full md:w-auto gap-4">
                            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full md:w-auto bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer" />
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Filter className="w-4 h-4 text-gray-500 hidden md:block" />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-40 bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer">
                                    <option value="All">All Statuses</option>
                                    <option value="Present">Present</option>
                                    <option value="Late">Late</option>
                                    <option value="Absent">Absent</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-500 border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4 text-center">Date</th>
                                        <th className="px-6 py-4 text-center">Check-In</th>
                                        <th className="px-6 py-4 text-center">Check-Out</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Manual Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {attLoading ? (
                                        <tr><td colSpan="6" className="px-6 py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" /><span className="text-sm text-gray-500 block mt-2">Loading...</span></td></tr>
                                    ) : filteredAttendance.length > 0 ? filteredAttendance.map((log) => (
                                        <tr key={log._id} className="hover:bg-gray-800/30 transition-colors group">
                                            <td className="px-6 py-4"><div className="flex flex-col"><span className="font-semibold text-gray-200">{log.employeeId?.name || "—"}</span><span className="text-xs text-gray-500 mt-0.5">{log.employeeId?.email || "—"}</span></div></td>
                                            <td className="px-6 py-4 text-center">{formatDate(log.date)}</td>
                                            <td className="px-6 py-4 text-center font-mono">{log.checkIn || "—"}</td>
                                            <td className="px-6 py-4 text-center font-mono">{log.checkOut || "—"}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${log.status === 'present' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : log.status === 'half-day' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                    {formatStatus(log.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {log.status === "absent" && (
                                                        <button onClick={() => handleMarkPresent(log)} className="text-xs bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white px-2 py-1 rounded border border-green-500/20 transition-colors">Mark Present</button>
                                                    )}
                                                    <button onClick={() => handleDeleteAttendance(log._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No attendance records found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* EMPLOYEES TAB */}
            {activeTab === "Employees" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex gap-4 items-center">
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                            <input type="text" placeholder="Search by ID, Name, or Department..." value={empSearchQuery} onChange={(e) => setEmpSearchQuery(e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-500 border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">Department</th>
                                        <th className="px-6 py-4">Designation</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {empLoading ? (
                                        <tr><td colSpan="5" className="px-6 py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" /><span className="text-sm text-gray-500 block mt-2">Loading...</span></td></tr>
                                    ) : filteredEmployees.length > 0 ? filteredEmployees.map((emp) => (
                                        <tr key={emp._id} className="hover:bg-gray-800/30 transition-colors group">
                                            <td className="px-6 py-4"><div className="flex flex-col"><span className="font-semibold text-gray-200">{emp.name}</span><span className="text-xs text-gray-500 mt-0.5">{emp.email}</span></div></td>
                                            <td className="px-6 py-4">{emp.department}</td>
                                            <td className="px-6 py-4">{emp.designation}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${emp.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                                                    {formatStatus(emp.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleViewProfile(emp)} className="p-1.5 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors cursor-pointer" title="View Profile"><Eye className="w-4 h-4" /></button>
                                                    <button onClick={() => handleToggleStatus(emp)} className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer" title="Toggle Status"><Ban className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteEmployee(emp._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No employees found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Employee Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><UserPlus className="w-5 h-5 text-orange-500" /> Add New Employee</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar text-sm text-gray-300">
                            <form onSubmit={handleSaveEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div><label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Full Name</label><input type="text" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none" placeholder="e.g. Jane Doe" /></div>
                                <div><label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Email</label><input type="email" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none" placeholder="e.g. jane@hrms.com" /></div>
                                <div><label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Phone</label><input type="text" value={newEmp.phone} onChange={e => setNewEmp({...newEmp, phone: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none" placeholder="+1 (555) 000-0000" /></div>
                                <div><label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Department</label>
                                    <select value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none">
                                        <option>Engineering</option><option>HR</option><option>Sales</option><option>Finance</option>
                                    </select>
                                </div>
                                <div><label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Designation</label><input type="text" value={newEmp.designation} onChange={e => setNewEmp({...newEmp, designation: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none" placeholder="e.g. Product Manager" /></div>
                            </form>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-800 flex justify-end gap-3 shrink-0 bg-[#111111]">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">Cancel</button>
                            <button onClick={handleSaveEmployee} className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20">Save Employee</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Profile Modal */}
            {selectedProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-orange-500" /> Employee Profile</h2>
                            <button onClick={() => setSelectedProfile(null)} className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-sm text-gray-300">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1 space-y-6">
                                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800 text-center">
                                        <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl font-bold text-orange-400 mb-4 mx-auto">{(selectedProfile.name || "?").charAt(0)}</div>
                                        <h3 className="text-lg font-bold text-white">{selectedProfile.name}</h3>
                                        <p className="text-xs text-orange-400 font-medium">{selectedProfile.designation}</p>
                                        <p className="text-xs text-gray-500 mt-1">{selectedProfile.department}</p>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800 space-y-4">
                                        <h4 className="text-sm font-semibold text-white border-b border-gray-800 pb-2">Information</h4>
                                        <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-500" /> <span>{selectedProfile.email}</span></div>
                                        <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-500" /> <span>{selectedProfile.phone || "—"}</span></div>
                                        <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-gray-500" /> <span>Joined: {formatDate(selectedProfile.createdAt)}</span></div>
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-6">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                                            <ShieldCheck className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                                            <div className="text-xl font-bold text-white">{formatStatus(selectedProfile.status)}</div>
                                            <div className="text-[10px] text-gray-500 uppercase mt-1">Status</div>
                                        </div>
                                        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                                            <Briefcase className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                                            <div className="text-xl font-bold text-white">{selectedProfile.department}</div>
                                            <div className="text-[10px] text-gray-500 uppercase mt-1">Department</div>
                                        </div>
                                        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                                            <Activity className="w-5 h-5 text-green-500 mx-auto mb-2" />
                                            <div className="text-xl font-bold text-white">{selectedProfile.designation}</div>
                                            <div className="text-[10px] text-gray-500 uppercase mt-1">Designation</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};