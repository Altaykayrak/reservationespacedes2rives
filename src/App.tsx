
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
import AdminLogin from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/prices" element={<Prices />} />
        <Route path="/terms-of-operation" element={<TermsOfOperation />} />
        <Route path="/holiday-program" element={<HolidayProgram />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/children" element={<Children />} />
          <Route path="/wednesday-reservations" element={<WednesdayReservations />} />
          <Route path="/holiday-reservations" element={<HolidayReservations />} />
          <Route path="/teenholiday-reservations" element={<TeenHolidayReservations />} />
          <Route path="/rdv" element={<RdvPage />} />
        </Route>
        
        <Route path="/admin" element={<AdminPage />}>
          <Route index element={<AdminDashboard />} />
          {/* Les sous-routes admin existantes seront automatiquement ajoutées ici */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
