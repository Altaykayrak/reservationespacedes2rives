import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import Index from "./pages/Index";
import { Toaster } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHolidays from "./pages/admin/AdminHolidays";
import AdminWednesdays from "./pages/admin/AdminWednesdays";
import AdminReservations from "./pages/admin/AdminReservations";
import Reservations from "./pages/Reservations";

function App() {
  return (
    <Router>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/reservations"
          element={
            <ProtectedRoute>
              <Reservations />
            </ProtectedRoute>
          }
        />
        
        {/* Routes administratives */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/holidays"
          element={
            <ProtectedRoute>
              <AdminHolidays />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/wednesdays"
          element={
            <ProtectedRoute>
              <AdminWednesdays />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reservations"
          element={
            <ProtectedRoute>
              <AdminReservations />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;