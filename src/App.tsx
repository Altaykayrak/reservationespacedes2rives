import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Children from "@/pages/Children";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Reservations from "@/pages/Reservations";
import HolidayReservations from "@/pages/HolidayReservations";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminWednesdays from "@/pages/admin/AdminWednesdays";
import AdminHolidays from "@/pages/admin/AdminHolidays";
import AdminReservations from "@/pages/admin/AdminReservations";
import AdminAuthorizedEmails from "@/pages/admin/AdminAuthorizedEmails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/children" element={<Children />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/holiday-reservations" element={<HolidayReservations />} />
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/wednesdays" element={<AdminWednesdays />} />
        <Route path="/admin/holidays" element={<AdminHolidays />} />
        <Route path="/admin/reservations" element={<AdminReservations />} />
        <Route path="/admin/authorized-emails" element={<AdminAuthorizedEmails />} />
      </Routes>
    </Router>
  );
}

export default App;