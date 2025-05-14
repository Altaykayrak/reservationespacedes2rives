
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Children from "./pages/Children";
import WednesdayReservations from "./pages/WednesdayReservations";
import { ProtectedRoute } from "./components/ProtectedRoute";
import TeenHolidayReservations from "./pages/TeenHolidayReservations";
import HolidayReservations from "./pages/HolidayReservations";
import HolidayProgram from "./pages/HolidayProgram";
import Prices from "./pages/Prices";
import TermsOfOperation from "./pages/TermsOfOperation";
import RdvPage from "./pages/Rdv";
import { AdminPage } from "./pages/admin/AdminPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";

// Import des pages admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfiles from "./pages/admin/AdminProfiles";
import AdminChildren from "./pages/admin/AdminChildren";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminWednesdays from "./pages/admin/AdminWednesdays";
import AdminHolidays from "./pages/admin/AdminHolidays";
import AdminRdv from "./pages/admin/AdminRdv";
import AdminAuthorizedEmails from "./pages/admin/AdminAuthorizedEmails";
import AdminNewReservation from "./pages/admin/AdminNewReservation";
import AdminNewHolidayReservation from "./pages/admin/AdminNewHolidayReservation";
import AdminNewTeenHolidayReservation from "./pages/admin/AdminNewTeenHolidayReservation";

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/prices" element={<Prices />} />
        <Route path="/terms-of-operation" element={<TermsOfOperation />} />
        <Route path="/holiday-program" element={<HolidayProgram />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        
        {/* Routes protégées par authentification */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/children" element={<ProtectedRoute><Children /></ProtectedRoute>} />
        <Route path="/wednesday-reservations" element={<ProtectedRoute><WednesdayReservations /></ProtectedRoute>} />
        <Route path="/holiday-reservations" element={<ProtectedRoute><HolidayReservations /></ProtectedRoute>} />
        <Route path="/teenholiday-reservations" element={<ProtectedRoute><TeenHolidayReservations /></ProtectedRoute>} />
        <Route path="/rdv" element={<ProtectedRoute><RdvPage /></ProtectedRoute>} />
        
        {/* Routes admin - accessibles sans authentification */}
        <Route path="/admin" element={<AdminPage />}>
          <Route index element={<AdminDashboard />} />
          <Route path="profiles" element={<AdminProfiles />} />
          <Route path="children" element={<AdminChildren />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="reservations/new" element={<AdminNewReservation />} />
          <Route path="reservations/new-holiday" element={<AdminNewHolidayReservation />} />
          <Route path="reservations/new-teen-holiday" element={<AdminNewTeenHolidayReservation />} />
          <Route path="wednesdays" element={<AdminWednesdays />} />
          <Route path="holidays" element={<AdminHolidays />} />
          <Route path="rdv" element={<AdminRdv />} />
          <Route path="authorized-emails" element={<AdminAuthorizedEmails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
