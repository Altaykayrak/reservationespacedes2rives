
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
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLoginPage";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminWednesdays from "./pages/admin/AdminWednesdays";
import AdminRdv from "./pages/admin/AdminRdv";
import AdminProfiles from "./pages/admin/AdminProfiles";
import AdminNewReservation from "./pages/admin/AdminNewReservation";
import AdminNewTeenHolidayReservation from "./pages/admin/AdminNewTeenHolidayReservation";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import AdminHolidays from "./pages/admin/AdminHolidays";
import AdminChildren from "./pages/admin/AdminChildren";
import AdminAuthorizedEmails from "./pages/admin/AdminAuthorizedEmails";

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
        <Route path="/admin-login" element={<AdminLogin />} />
        
        {/* Routes protégées utilisateur */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/children" element={<Children />} />
          <Route path="/wednesday-reservations" element={<WednesdayReservations />} />
          <Route path="/holiday-reservations" element={<HolidayReservations />} />
          <Route path="/teenholiday-reservations" element={<TeenHolidayReservations />} />
          <Route path="/rdv" element={<RdvPage />} />
        </Route>
        
        {/* Routes admin - sans aucune vérification ni redirection */}
        <Route path="/admin" element={
          <div className="min-h-screen bg-gray-50">
            <AdminNavbar />
            <main className="container mx-auto p-8">
              <AdminDashboard />
            </main>
          </div>
        } />
        <Route path="/admin/reservations" element={
          <div className="min-h-screen bg-gray-50">
            <AdminNavbar />
            <main className="container mx-auto p-8">
              <AdminReservations />
            </main>
          </div>
        } />
        <Route path="/admin/wednesdays" element={
          <div className="min-h-screen bg-gray-50">
            <AdminNavbar />
            <main className="container mx-auto p-8">
              <AdminWednesdays />
            </main>
          </div>
        } />
        <Route path="/admin/rdv" element={
          <div className="min-h-screen bg-gray-50">
            <AdminNavbar />
            <main className="container mx-auto p-8">
              <AdminRdv />
            </main>
          </div>
        } />
        <Route path="/admin/profiles" element={
          <div className="min-h-screen bg-gray-50">
            <AdminNavbar />
            <main className="container mx-auto p-8">
              <AdminProfiles />
            </main>
          </div>
        } />
        <Route path="/admin/new-reservation" element={
          <div className="min-h-screen bg-gray-50">
            <AdminNavbar />
            <main className="container mx-auto p-8">
              <AdminNewReservation />
            </main>
          </div>
        } />
        <Route path="/admin/new-teen-holiday-reservation" element={
          <div className="min-h-screen bg-gray-50">
            <AdminNavbar />
            <main className="container mx-auto p-8">
              <AdminNewTeenHolidayReservation />
            </main>
          </div>
        } />
        {/* Ajout des routes manquantes */}
        <Route path="/admin/holidays" element={
          <div className="min-h-screen bg-gray-50">
            <AdminNavbar />
            <main className="container mx-auto p-8">
              <AdminHolidays />
            </main>
          </div>
        } />
        <Route path="/admin/children" element={
          <div className="min-h-screen bg-gray-50">
            <AdminNavbar />
            <main className="container mx-auto p-8">
              <AdminChildren />
            </main>
          </div>
        } />
        <Route path="/admin/authorized-emails" element={
          <div className="min-h-screen bg-gray-50">
            <AdminNavbar />
            <main className="container mx-auto p-8">
              <AdminAuthorizedEmails />
            </main>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
