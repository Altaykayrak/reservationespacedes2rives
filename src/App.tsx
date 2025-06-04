
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Children from "./pages/Children";
import WednesdayReservations from "./pages/WednesdayReservations";
import HolidayReservations from "./pages/HolidayReservations";
import TeenHolidayReservations from "./pages/TeenHolidayReservations";
import HolidayProgram from "./pages/HolidayProgram";
import TermsOfService from "./pages/TermsOfService";
import TermsOfOperation from "./pages/TermsOfOperation";
import Prices from "./pages/Prices";
import Rdv from "./pages/Rdv";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { AdminPage } from "./pages/admin/AdminPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfiles from "./pages/admin/AdminProfiles";
import AdminChildren from "./pages/admin/AdminChildren";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminWednesdays from "./pages/admin/AdminWednesdays";
import AdminHolidays from "./pages/admin/AdminHolidays";
import AdminRdv from "./pages/admin/AdminRdv";
import AdminAuthorizedEmails from "./pages/admin/AdminAuthorizedEmails";
import AdminAvailableSpots from "./pages/admin/AdminAvailableSpots";
import AdminWednesdaySpots from "./pages/admin/AdminWednesdaySpots";
import AdminHolidaySpots from "./pages/admin/AdminHolidaySpots";
import AdminNewReservation from "./pages/admin/AdminNewReservation";
import AdminNewHolidayReservation from "./pages/admin/AdminNewHolidayReservation";
import AdminNewTeenHolidayReservation from "./pages/admin/AdminNewTeenHolidayReservation";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="holiday-program" element={<HolidayProgram />} />
                <Route path="terms-of-service" element={<TermsOfService />} />
                <Route path="terms-of-operation" element={<TermsOfOperation />} />
                <Route path="prices" element={<Prices />} />
                <Route path="rdv" element={<ProtectedRoute><Rdv /></ProtectedRoute>} />
                <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="children" element={<ProtectedRoute><Children /></ProtectedRoute>} />
                <Route path="wednesday-reservations" element={<ProtectedRoute><WednesdayReservations /></ProtectedRoute>} />
                <Route path="holiday-reservations" element={<ProtectedRoute><HolidayReservations /></ProtectedRoute>} />
                <Route path="teen-holiday-reservations" element={<ProtectedRoute><TeenHolidayReservations /></ProtectedRoute>} />
              </Route>
              
              <Route path="/admin-login" element={<AdminLoginPage />} />
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
                <Route path="available-spots" element={<AdminAvailableSpots />} />
                <Route path="wednesday-spots" element={<AdminWednesdaySpots />} />
                <Route path="holiday-spots" element={<AdminHolidaySpots />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}

export default App;
