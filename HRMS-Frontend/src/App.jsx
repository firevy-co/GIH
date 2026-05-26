import { AuthLayout } from "./layouts/AuthLayout"
import { Routes, Route, Navigate } from "react-router-dom"
import { Login } from "./pages/auth/Login"
import { Register } from "./pages/auth/Register"
import { Home } from "./pages/user/Home"
import { UserLayout } from "./layouts/UserLayout"
import { Investments } from "./pages/user/Investments"
import { Documents } from "./pages/user/Documents"
import { Notifications } from "./pages/user/Notifications"
import { Profile } from "./pages/user/Profile"
import { Search } from "./pages/user/Search"
import { AdminLayout } from "./layouts/AdminLayout"
import { AdminDashboard } from "./pages/admin/dashboard"
import { AdminAttendance } from "./pages/admin/attendance"
import { AdminDocuments } from "./pages/admin/documents"
import { AdminLeaves } from "./pages/admin/leaves"
import { AdminNotifications } from "./pages/admin/notifications"
import { AdminProfile } from "./pages/admin/profile"
import { AdminSettings } from "./pages/admin/settings"
import { AdminUsers } from "./pages/admin/users"
import { AdminReports } from "./pages/admin/reports"
import { AdminInvestments } from "./pages/admin/investments"
import { StaffLayout } from "./layouts/StaffLayout"
import { StaffDashboard } from "./pages/staff/dashboard"
import { StaffAttendance } from "./pages/staff/attendance"
import { StaffLeaves } from "./pages/staff/leaves"
import { StaffDocuments } from "./pages/staff/documents"
import { StaffUsers } from "./pages/staff/users"
import { StaffNotifications } from "./pages/staff/notifications"
import { StaffProfile } from "./pages/staff/profile"
import { CheckAuth } from "./components/common/checkAuth"

function App() {

  return (
    <>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<CheckAuth><AuthLayout /></CheckAuth>}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* User Routes */}
        <Route path="/user" element={<CheckAuth><UserLayout /></CheckAuth>}>
          <Route path="home" element={<Home />} />
          <Route path="investments" element={<Investments />} />
          <Route path="documents" element={<Documents />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="search" element={<Search />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<CheckAuth><AdminLayout /></CheckAuth>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="investments" element={<AdminInvestments />} />
          <Route path="leaves" element={<AdminLeaves />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={<CheckAuth><StaffLayout /></CheckAuth>}>
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="attendance" element={<StaffAttendance />} />
          <Route path="leaves" element={<StaffLeaves />} />
          <Route path="documents" element={<StaffDocuments />} />
          <Route path="users" element={<StaffUsers />} />
          <Route path="notifications" element={<StaffNotifications />} />
          <Route path="profile" element={<StaffProfile />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
