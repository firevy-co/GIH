import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileSpreadsheet, FileText, Download, Filter, Calendar, Users, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { fetchAllUsers } from "../../redux/slices/userSlice";
import { fetchInvestments } from "../../redux/slices/investmentSlice";
import { fetchAttendance } from "../../redux/slices/attendanceSlice";
import { fetchDocuments } from "../../redux/slices/documentSlice";

export const AdminReports = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const usersState = useSelector((state) => state.users?.users || []);
    const investmentsState = useSelector((state) => state.investments?.investments || []);
    const attendanceState = useSelector((state) => state.attendance?.attendance || []);
    const documentsState = useSelector((state) => state.documents?.documents || []);

    const [reportType, setReportType] = useState("Revenue");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [selectedUser, setSelectedUser] = useState("All");
    const [selectedInvestment, setSelectedInvestment] = useState("All");
    
    // UI state for fake/real generation
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedReports, setGeneratedReports] = useState([]);

    // Fetch data on mount
    useEffect(() => {
        dispatch(fetchAllUsers());
        dispatch(fetchInvestments());
        dispatch(fetchAttendance());
        dispatch(fetchDocuments());
    }, [dispatch]);

    const handleGenerate = (format) => {
        setIsGenerating(true);

        setTimeout(() => {
            setIsGenerating(false);

            let headers = [];
            let rows = [];
            let filename = `${reportType}_Report_${Date.now()}`;

            if (reportType === "Users") {
                headers = ["User ID", "Name", "Email", "Phone", "Role", "Status", "KYC Status", "Created At"];
                let filtered = [...usersState];
                if (selectedUser !== "All") {
                    filtered = filtered.filter(u => u._id === selectedUser);
                }
                rows = filtered.map(u => [
                    `"${u._id}"`,
                    `"${u.name || ''}"`,
                    `"${u.email || ''}"`,
                    `"${u.phone || '—'}"`,
                    `"${u.role || ''}"`,
                    `"${u.status || ''}"`,
                    `"${u.kycStatus || ''}"`,
                    `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}"`
                ]);
            } else if (reportType === "Investments") {
                headers = ["Investment ID", "User Name", "Plan Name", "Amount", "Status", "Created At"];
                let filtered = [...investmentsState];
                if (selectedUser !== "All") {
                    filtered = filtered.filter(i => i.userId === selectedUser || i.userId?._id === selectedUser);
                }
                if (selectedInvestment !== "All") {
                    filtered = filtered.filter(i => i.planName === selectedInvestment);
                }
                rows = filtered.map(i => [
                    `"${i._id}"`,
                    `"${i.userId?.name || i.userName || '—'}"`,
                    `"${i.planName || '—'}"`,
                    i.amount,
                    `"${i.status || ''}"`,
                    `"${i.createdAt ? new Date(i.createdAt).toLocaleDateString() : '—'}"`
                ]);
            } else if (reportType === "Attendance") {
                headers = ["Attendance ID", "Employee Name", "Date", "Check In", "Check Out", "Status", "Hours Worked"];
                let filtered = [...attendanceState];
                if (selectedUser !== "All") {
                    filtered = filtered.filter(a => a.employeeId === selectedUser || a.user?._id === selectedUser);
                }
                rows = filtered.map(a => [
                    `"${a._id}"`,
                    `"${a.user?.name || '—'}"`,
                    `"${a.checkIn ? new Date(a.checkIn).toLocaleDateString() : '—'}"`,
                    `"${a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '—'}"`,
                    `"${a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '—'}"`,
                    `"${a.status || ''}"`,
                    a.hoursWorked || 0
                ]);
            } else if (reportType === "Documents") {
                headers = ["Document ID", "Title", "Category", "URL", "Status", "Created At"];
                rows = documentsState.map(d => [
                    `"${d._id}"`,
                    `"${d.title || ''}"`,
                    `"${d.category || '—'}"`,
                    `"${d.fileUrl || ''}"`,
                    `"${d.status || ''}"`,
                    `"${d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}"`
                ]);
            } else {
                // Revenue / General fallback
                headers = ["Category", "Total Value", "Date Range", "System Status"];
                rows = [
                    ["\"Investments Total\"", investmentsState.reduce((sum, i) => sum + (Number(i.amount) || 0), 0), "\"All Time\"", "\"Active\""],
                    ["\"Total Users Registered\"", usersState.length, "\"All Time\"", "\"Active\""],
                    ["\"Total Attendance Records\"", attendanceState.length, "\"All Time\"", "\"Active\""]
                ];
            }

            // Client-side download trigger
            const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
                + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${filename}.${format === 'Excel' ? 'csv' : 'txt'}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Add generated report to local list
            const newReport = {
                id: `REP-${Math.floor(100 + Math.random() * 900)}`,
                name: `${reportType} Dynamic Export`,
                type: reportType,
                requestedBy: "Admin",
                date: new Date().toLocaleString(),
                size: `${(csvContent.length / 1024).toFixed(1)} KB`,
                format: format
            };
            setGeneratedReports(prev => [newReport, ...prev]);

            alert(`Successfully generated ${reportType} report containing ${rows.length} records!`);
        }, 1200);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Data & Reports</h1>
                    <p className="text-sm text-gray-400 mt-1">Generate analytics, configure custom filters, and export data securely.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Generator & Filters */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Report Configuration Card */}
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 shadow-lg">
                        <div className="flex items-center gap-2 mb-5 border-b border-gray-800 pb-3">
                            <Filter className="w-5 h-5 text-orange-500" />
                            <h2 className="text-lg font-bold text-white">Report Configuration</h2>
                        </div>

                        <div className="space-y-5">
                            
                            {/* Type Selection */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">1. Select Report Type</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['Attendance', 'Investments', 'Users', 'Documents', 'Revenue'].map((type) => (
                                        <button 
                                            key={type}
                                            onClick={() => setReportType(type)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                                                reportType === type 
                                                ? 'bg-orange-500/10 border-orange-500 text-orange-400' 
                                                : 'bg-[#1a1a1a] border-gray-800 text-gray-400 hover:border-gray-600'
                                            }`}
                                        >
                                            {type === 'Attendance' && <Clock className="w-4 h-4" />}
                                            {type === 'Investments' && <TrendingUp className="w-4 h-4" />}
                                            {type === 'Users' && <Users className="w-4 h-4" />}
                                            {type === 'Documents' && <FileText className="w-4 h-4" />}
                                            {type === 'Revenue' && <FileSpreadsheet className="w-4 h-4" />}
                                            {type} Data
                                            
                                            {reportType === type && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="pt-4 border-t border-gray-800">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-3">2. Apply Filters</label>
                                
                                <div className="space-y-4">
                                    {/* Date Filter */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <span className="text-[10px] text-gray-500 mb-1 block">Start Date</span>
                                            <input 
                                                type="date" 
                                                value={dateRange.start}
                                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                                className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 mb-1 block">End Date</span>
                                            <input 
                                                type="date" 
                                                value={dateRange.end}
                                                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                                className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-orange-500"
                                            />
                                        </div>
                                    </div>

                                    {/* User Filter */}
                                    <div>
                                        <span className="text-[10px] text-gray-500 mb-1 block">Target User / Employee</span>
                                        <select 
                                            value={selectedUser}
                                            onChange={(e) => setSelectedUser(e.target.value)}
                                            className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                                        >
                                            <option value="All">All Users</option>
                                            {usersState.map((u) => (
                                                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Investment Filter (Conditional or Global) */}
                                    <div>
                                        <span className="text-[10px] text-gray-500 mb-1 block">Investment Type</span>
                                        <select 
                                            value={selectedInvestment}
                                            onChange={(e) => setSelectedInvestment(e.target.value)}
                                            className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                                        >
                                            <option value="All">All Investments</option>
                                            <option value="Standard Plan">Standard Plan</option>
                                            <option value="Premium Plan">Premium Plan</option>
                                            <option value="VIP Plan">VIP Plan</option>
                                            <option value="Gold Plan">Gold Plan</option>
                                            <option value="Real Estate">Real Estate Fund</option>
                                            <option value="Equities">Equities</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Export Actions Card */}
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 shadow-lg">
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-3">3. Generate & Export</label>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleGenerate('PDF')}
                                disabled={isGenerating}
                                className="flex-1 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                <FileText className="w-4 h-4" /> {isGenerating ? "Generating..." : "PDF (Text)"}
                            </button>
                            <button 
                                onClick={() => handleGenerate('Excel')}
                                disabled={isGenerating}
                                className="flex-1 bg-green-500/10 hover:bg-green-500 hover:text-white text-green-500 border border-green-500/20 font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                <FileSpreadsheet className="w-4 h-4" /> {isGenerating ? "Generating..." : "Excel/CSV"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Reports History */}
                <div className="lg:col-span-2">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-lg flex flex-col h-full">
                        <div className="flex items-center justify-between p-5 border-b border-gray-800 shrink-0">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-orange-500" /> Generated Reports History
                            </h2>
                        </div>
                        
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-500 border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Report Name</th>
                                        <th className="px-6 py-4 text-center">Type</th>
                                        <th className="px-6 py-4 text-center">Date Generated</th>
                                        <th className="px-6 py-4 text-center">Format</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {generatedReports.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                                                No reports generated yet. Configure report type & filters, then export to generate a live report.
                                            </td>
                                        </tr>
                                    ) : (
                                        generatedReports.map((report) => (
                                            <tr key={report.id} className="hover:bg-gray-800/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-200 group-hover:text-orange-400 transition-colors">{report.name}</span>
                                                        <span className="text-[10px] text-gray-500 mt-0.5">{report.id} • {report.size}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2.5 py-1 bg-gray-800 rounded-md text-[10px] font-bold text-gray-300">
                                                        {report.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-mono text-gray-400">
                                                    {report.date}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                                                        report.format === 'PDF' ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-green-400 bg-green-500/10 border border-green-500/20'
                                                    }`}>
                                                        {report.format === 'PDF' ? <FileText className="w-3 h-3" /> : <FileSpreadsheet className="w-3 h-3" />}
                                                        {report.format}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => {
                                                            // trigger mock download
                                                            const csvContent = "data:text/csv;charset=utf-8,\uFEFFCategory,Value\nMocked," + report.size;
                                                            const link = document.createElement("a");
                                                            link.setAttribute("href", encodeURI(csvContent));
                                                            link.setAttribute("download", `${report.name.replace(/\s+/g, '_')}.${report.format === 'PDF' ? 'txt' : 'csv'}`);
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                        }}
                                                        className="text-xs bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white px-3 py-1.5 rounded border border-orange-500/20 transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                                                    >
                                                        <Download className="w-3.5 h-3.5" /> Download
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
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