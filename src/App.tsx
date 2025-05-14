
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Profile from "@/pages/Profile";
import Reservations from "@/pages/WednesdayReservations";
import TeenHolidayReservations from "@/pages/TeenHolidayReservations";
import Account from "@/pages/Account";
import Contact from "@/pages/Contact";
import Admin from "@/pages/admin/AdminPage";
import { AdminUsers } from "@/pages/admin/AdminUsers";
import AdminReservations from "@/pages/admin/AdminReservations";
import AdminNewReservation from "@/pages/admin/AdminNewReservation";
import AdminNewHolidayReservation from "@/pages/admin/AdminNewHolidayReservation";
import AdminNewTeenHolidayReservation from "@/pages/admin/AdminNewTeenHolidayReservation";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/teenholiday-reservations" element={<TeenHolidayReservations />} />
        <Route path="/account" element={<Account />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/reservations" element={<AdminReservations />} />
        <Route path="/admin/reservations/new" element={<AdminNewReservation />} />
        <Route path="/admin/reservations/new-holiday" element={<AdminNewHolidayReservation />} />
        <Route path="/admin/reservations/new-teen-holiday" element={<AdminNewTeenHolidayReservation />} />
        <Route path="/admin/new-teenholiday-reservation" element={<AdminNewTeenHolidayReservation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
