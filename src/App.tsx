
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Children from "@/pages/Children";
import WednesdayReservations from "@/pages/WednesdayReservations";
import HolidayReservations from "@/pages/HolidayReservations";
import TeenHolidayReservations from "@/pages/TeenHolidayReservations";
import HolidayProgram from "@/pages/HolidayProgram";
import TermsOfService from "@/pages/TermsOfService";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import { AdminPage } from "@/pages/admin/AdminPage";
import AdminWednesdays from "@/pages/admin/AdminWednesdays";
import AdminHolidays from "@/pages/admin/AdminHolidays";
import AdminReservations from "@/pages/admin/AdminReservations";
import AdminChildren from "@/pages/admin/AdminChildren";
import AdminProfiles from "@/pages/admin/AdminProfiles";
import AdminNewReservation from "@/pages/admin/AdminNewReservation";
import AdminNewHolidayReservation from "@/pages/admin/AdminNewHolidayReservation";
import AdminNewTeenHolidayReservation from "@/pages/admin/AdminNewTeenHolidayReservation";
import AdminChildReservations from "@/pages/admin/AdminChildReservations";
import AdminAuthorizedEmails from "@/pages/admin/AdminAuthorizedEmails";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToasterLayout } from "@/components/layouts/ToasterLayout";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import "@/App.css";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthLayout title="L'espace des deux rives">
          <ToasterLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route
                path="/holiday-program"
                element={<HolidayProgram />}
              />

              {/* User Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/children"
                element={
                  <ProtectedRoute>
                    <Children />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wednesday-reservations"
                element={
                  <ProtectedRoute>
                    <WednesdayReservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/holiday-reservations"
                element={
                  <ProtectedRoute>
                    <HolidayReservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teenholiday-reservations"
                element={
                  <ProtectedRoute>
                    <TeenHolidayReservations />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/wednesdays"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminWednesdays />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/holidays"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminHolidays />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reservations"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminReservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/children"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminChildren />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/profiles"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminProfiles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/new-reservation"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminNewReservation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/new-holiday-reservation"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminNewHolidayReservation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/new-teenholiday-reservation"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminNewTeenHolidayReservation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/child-reservations/:childId"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminChildReservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/authorized-emails"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminAuthorizedEmails />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Routes>
          </ToasterLayout>
        </AuthLayout>
      </Router>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
