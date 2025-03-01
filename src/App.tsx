
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./components/ErrorFallback";

import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Children from "./pages/Children";
import WednesdayReservations from "./pages/WednesdayReservations";
import HolidayReservations from "./pages/HolidayReservations";
import TeenHolidayReservations from "./pages/TeenHolidayReservations";
import HolidayProgram from "./pages/HolidayProgram";
import TermsOfService from "./pages/TermsOfService";
import AdminPage from "./pages/admin/AdminPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminProfiles from "./pages/admin/AdminProfiles";
import AdminChildren from "./pages/admin/AdminChildren";
import AdminAuthorizedEmails from "./pages/admin/AdminAuthorizedEmails";
import AdminWednesdays from "./pages/admin/AdminWednesdays";
import AdminHolidays from "./pages/admin/AdminHolidays";
import AdminNewReservation from "./pages/admin/AdminNewReservation";
import AdminNewHolidayReservation from "./pages/admin/AdminNewHolidayReservation";
import AdminNewTeenHolidayReservation from "./pages/admin/AdminNewTeenHolidayReservation";
import Rdv from "./pages/Rdv";
import AdminRdv from "./pages/admin/AdminRdv";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

function App() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (error) {
      console.error("Caught an error:", error);
    }
  }, [error]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Rendez-vous */}
          <Route path="/rdv" element={<Rdv />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/children" element={<Children />} />
            <Route path="/wednesday-reservations" element={<WednesdayReservations />} />
            <Route path="/holiday-reservations" element={<HolidayReservations />} />
            <Route path="/teenholiday-reservations" element={<TeenHolidayReservations />} />
          </Route>
          
          <Route path="/holiday-program" element={<HolidayProgram />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminPage />}>
            <Route index element={<AdminDashboard />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="profiles" element={<AdminProfiles />} />
            <Route path="children" element={<AdminChildren />} />
            <Route path="authorized-emails" element={<AdminAuthorizedEmails />} />
            <Route path="wednesdays" element={<AdminWednesdays />} />
            <Route path="holidays" element={<AdminHolidays />} />
            <Route path="new-reservation" element={<AdminNewReservation />} />
            <Route path="new-holiday-reservation" element={<AdminNewHolidayReservation />} />
            <Route path="new-teenholiday-reservation" element={<AdminNewTeenHolidayReservation />} />
            <Route path="rdv" element={<AdminRdv />} />
          </Route>

          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </ErrorBoundary>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

function ProtectedRoute() {
  const isLoggedIn = localStorage.getItem("sb-dddtybmradplydzymrly-auth-token");

  return isLoggedIn ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}
