
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Children from "./pages/Children";
import TermsOfService from "./pages/TermsOfService";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { AdminPage } from "./pages/admin/AdminPage";
import AdminProfiles from "./pages/admin/AdminProfiles";
import AdminAuthorizedEmails from "./pages/admin/AdminAuthorizedEmails";
import AdminChildren from "./pages/admin/AdminChildren";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminHolidays from "./pages/admin/AdminHolidays";
import AdminWednesdays from "./pages/admin/AdminWednesdays";
import AdminNewReservation from "./pages/admin/AdminNewReservation";
import AdminNewHolidayReservation from "./pages/admin/AdminNewHolidayReservation";
import AdminNewTeenHolidayReservation from "./pages/admin/AdminNewTeenHolidayReservation";
import WednesdayReservations from "./pages/WednesdayReservations";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToasterLayout } from "./components/layouts/ToasterLayout";
import HolidayReservations from "./pages/HolidayReservations";
import TeenHolidayReservations from "./pages/TeenHolidayReservations";
import HolidayProgram from "./pages/HolidayProgram";
import { ProtectedRoute } from "./components/ProtectedRoute";

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <ErrorBoundary>
            <ToasterLayout>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                  <Route path="terms-of-service" element={<TermsOfService />} />
                  <Route path="profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="children" element={
                    <ProtectedRoute>
                      <Children />
                    </ProtectedRoute>
                  } />
                  <Route path="wednesday-reservations" element={
                    <ProtectedRoute>
                      <WednesdayReservations />
                    </ProtectedRoute>
                  } />
                  <Route path="holiday-reservations" element={
                    <ProtectedRoute>
                      <HolidayReservations />
                    </ProtectedRoute>
                  } />
                  <Route path="teenholiday-reservations" element={
                    <ProtectedRoute>
                      <TeenHolidayReservations />
                    </ProtectedRoute>
                  } />
                  <Route path="holiday-program" element={<HolidayProgram />} />
                </Route>

                <Route path="/admin-login" element={<AdminLoginPage />} />
                
                <Route path="/admin" element={<AdminPage />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="profiles" element={<AdminProfiles />} />
                  <Route path="authorized-emails" element={<AdminAuthorizedEmails />} />
                  <Route path="children" element={<AdminChildren />} />
                  <Route path="reservations" element={<AdminReservations />} />
                  <Route path="reservations/new" element={<AdminNewReservation />} />
                  <Route path="reservations/new-holiday" element={<AdminNewHolidayReservation />} />
                  <Route path="reservations/new-teen-holiday" element={<AdminNewTeenHolidayReservation />} />
                  <Route path="holidays" element={<AdminHolidays />} />
                  <Route path="wednesdays" element={<AdminWednesdays />} />
                </Route>
              </Routes>
            </ToasterLayout>
          </ErrorBoundary>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
