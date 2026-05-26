import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    Users, 
    UserCheck, 
    Briefcase, 
    FileText, 
    CalendarOff, 
    Clock, 
    ArrowUpRight, 
    ArrowDownRight,
    Loader2
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar,
    LineChart, Line
} from "recharts";
import { fetchAdminDashboard, fetchAnalytics } from "../../redux/slices/dashboardSlice";

export const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { stats, analytics, loading } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchAdminDashboard());
        dispatch(fetchAnalytics());
    }, [dispatch]);

    // Build stats cards from API data
    const statsCards = stats ? [
        { name: "Total Users", value: stats.organization?.totalUsers?.toLocaleString() || "0", change: "+12%", trend: "up", icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" },
        { name: "Total Employees", value: stats.organization?.totalEmployees?.toLocaleString() || "0", change: "+3%", trend: "up", icon: UserCheck, color: "text-orange-500", bg: "bg-orange-500/10" },
        { name: "Active Investments", value: `$${((stats.financials?.activeInvestmentsSum || 0) / 1000).toFixed(0)}K`, change: "+8%", trend: "up", icon: Briefcase, color: "text-green-500", bg: "bg-green-500/10" },
        { name: "Pending Documents", value: String(stats.documents?.pendingSignatures || 0), change: "-5%", trend: "down", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
        { name: "Leave Requests", value: String(stats.leaves?.pending || 0), change: "+2%", trend: "up", icon: CalendarOff, color: "text-purple-500", bg: "bg-purple-500/10" },
        { name: "Attendance Today", value: stats.organization?.totalEmployees > 0 ? `${Math.round((stats.todayAttendance?.present / stats.organization.totalEmployees) * 100)}%` : "0%", change: "0%", trend: "neutral", icon: Clock, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    ] : [];

    // Build chart data from analytics
    const investmentData = analytics?.investments?.map(inv => ({
        name: inv._id || "Other",
        amount: inv.totalAmount || 0,
    })) || [];

    const attendanceData = analytics ? [
        { name: "Present", present: analytics.attendance?.presentRecords || 0 },
        { name: "Total", present: analytics.attendance?.totalRecords || 0 },
    ] : [];

    // Department distribution for bar chart
    const departmentData = analytics?.departments?.map(d => ({
        name: d._id || "Other",
        count: d.count || 0,
    })) || [];

    const recentActivities = [
        { id: 1, type: "registration", title: "New User Registered", desc: `Total users: ${stats?.organization?.totalUsers || 0}`, time: "Live data", icon: Users, iconColor: "text-orange-500", iconBg: "bg-orange-500/10" },
        { id: 2, type: "investment", title: "Active Investments", desc: `Total: $${((stats?.financials?.activeInvestmentsSum || 0)).toLocaleString()}`, time: "Live data", icon: Briefcase, iconColor: "text-green-500", iconBg: "bg-green-500/10" },
        { id: 3, type: "document", title: "Documents Pending", desc: `${stats?.documents?.pendingSignatures || 0} documents await signatures`, time: "Live data", icon: FileText, iconColor: "text-orange-500", iconBg: "bg-orange-500/10" },
        { id: 4, type: "staff", title: "Leave Requests", desc: `${stats?.leaves?.pending || 0} pending, ${stats?.leaves?.approved || 0} approved`, time: "Live data", icon: UserCheck, iconColor: "text-purple-500", iconBg: "bg-purple-500/10" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                    <span className="text-sm">Loading dashboard data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-sm text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statsCards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 hover:border-orange-500/50 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div className={`flex items-center text-xs font-semibold ${stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-rose-500' : 'text-gray-400'}`}>
                                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : stat.trend === 'down' ? <ArrowDownRight className="w-3 h-3 mr-0.5" /> : null}
                                    {stat.change}
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                                <p className="text-xs text-gray-400 mt-1">{stat.name}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Investment Breakdown Area Chart */}
                <div className="lg:col-span-2 bg-[#1a1a1a] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-base font-semibold text-white mb-4">Investment Breakdown by Type</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={investmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#f97316' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Department Distribution */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-base font-semibold text-white mb-4">Department Distribution</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                                <RechartsTooltip 
                                    cursor={false}
                                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="count" name="Employees" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Leave Stats */}
                <div className="lg:col-span-2 bg-[#1a1a1a] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-base font-semibold text-white mb-4">Leave & Attendance Summary</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: "Pending", value: stats?.leaves?.pending || 0 },
                                { name: "Approved", value: stats?.leaves?.approved || 0 },
                                { name: "Rejected", value: stats?.leaves?.rejected || 0 },
                                { name: "Present Today", value: stats?.todayAttendance?.present || 0 },
                                { name: "Absent Today", value: stats?.todayAttendance?.absent || 0 },
                            ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                                <RechartsTooltip 
                                    cursor={false}
                                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="value" name="Count" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 flex flex-col h-[23rem]">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                        <h3 className="text-base font-semibold text-white">Live Summary</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        {recentActivities.map((activity, index) => {
                            const Icon = activity.icon;
                            return (
                                <div key={activity.id} className="flex gap-4">
                                    <div className="relative flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.iconBg} ${activity.iconColor}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        {/* Connector Line (except for last item) */}
                                        {index !== recentActivities.length - 1 && (
                                            <div className="w-px h-full bg-gray-800 mt-2"></div>
                                        )}
                                    </div>
                                    <div className="pb-4">
                                        <h4 className="text-sm font-medium text-gray-200">{activity.title}</h4>
                                        <p className="text-xs text-gray-400 mt-1">{activity.desc}</p>
                                        <span className="text-[10px] text-gray-500 mt-2 block">{activity.time}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};