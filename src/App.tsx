
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Children from "./pages/Children";
import WednesdayReservations from "./pages/WednesdayReservations";
import HolidayReservations from "./pages/HolidayReservations";
import TeenHolidayReservations from "./pages/TeenHolidayReservations";
import Rdv from "./pages/Rdv";
import TermsOfService from "./pages/TermsOfService";
import TermsOfOperation from "./pages/TermsOfOperation";
import HolidayProgram from "./pages/HolidayProgram";
import FestivalProgram from "./pages/FestivalProgram";
import Prices from "./pages/Prices";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Import admin pages
import { AdminPage } from "./pages/admin/AdminPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminNewReservation from "./pages/admin/AdminNewReservation";
import AdminNewHolidayReservation from "./pages/admin/AdminNewHolidayReservation";
import AdminNewTeenHolidayReservation from "./pages/admin/AdminNewTeenHolidayReservation";
import AdminWednesdays from "./pages/admin/AdminWednesdays";
import AdminHolidays from "./pages/admin/AdminHolidays";
import AdminChildren from "./pages/admin/AdminChildren";
import AdminProfiles from "./pages/admin/AdminProfiles";
import AdminAuthorizedEmails from "./pages/admin/AdminAuthorizedEmails";
import AdminRdv from "./pages/admin/AdminRdv";
import AdminAvailableSpots from "./pages/admin/AdminAvailableSpots";
import AdminWednesdaySpots from "./pages/admin/AdminWednesdaySpots";
import AdminHolidaySpots from "./pages/admin/AdminHolidaySpots";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminWednesdayReservations from "./pages/admin/AdminWednesdayReservations";
import AdminHolidayReservations from "./pages/admin/AdminHolidayReservations";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/terms-of-operation" element={<TermsOfOperation />} />
            <Route path="/holiday-program" element={<HolidayProgram />} />
            {/* <Route path="/festival-program" element={<FestivalProgram />} /> */}
            <Route path="/prices" element={<Prices />} />
            
            {/* Protected routes */}
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
            <Route
              path="/rdv"
              element={
                <ProtectedRoute>
                  <Rdv />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="wednesdayreservations" element={<AdminWednesdayReservations />} />
              <Route path="holidayreservations" element={<AdminHolidayReservations />} />
              <Route path="reservations/new" element={<AdminNewReservation />} />
              <Route path="reservations/new-holiday" element={<AdminNewHolidayReservation />} />
              <Route path="reservations/new-teen-holiday" element={<AdminNewTeenHolidayReservation />} />
              <Route path="wednesdays" element={<AdminWednesdays />} />
              <Route path="holidays" element={<AdminHolidays />} />
              <Route path="children" element={<AdminChildren />} />
              <Route path="profiles" element={<AdminProfiles />} />
              <Route path="authorized-emails" element={<AdminAuthorizedEmails />} />
              <Route path="rdv" element={<AdminRdv />} />
              <Route path="spots" element={<AdminAvailableSpots />} />
              <Route path="spots/wednesday" element={<AdminWednesdaySpots />} />
              <Route path="spots/holiday" element={<AdminHolidaySpots />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
