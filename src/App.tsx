
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Children from "@/pages/Children";
import ForgotPassword from "@/pages/ForgotPassword";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLogin from "@/pages/AdminLogin";
import AdminReservations from "@/pages/admin/AdminReservations";
import AdminWednesdays from "@/pages/admin/AdminWednesdays";
import AdminHolidays from "@/pages/admin/AdminHolidays";
import AdminAuthorizedEmails from "@/pages/admin/AdminAuthorizedEmails";
import HolidayReservations from "@/pages/HolidayReservations";
import TeenHolidayReservations from "@/pages/TeenHolidayReservations";
import HolidayProgram from "@/pages/HolidayProgram";
import TermsOfService from "@/pages/TermsOfService";
import WednesdayReservations from "@/pages/WednesdayReservations";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/children",
    element: (
      <ProtectedRoute>
        <Children />
      </ProtectedRoute>
    ),
  },
  {
    path: "/holiday-program",
    element: <HolidayProgram />,
  },
  {
    path: "/holiday-reservations",
    element: (
      <ProtectedRoute>
        <HolidayReservations />
      </ProtectedRoute>
    ),
  },
  {
    path: "/teenholiday-reservations",
    element: (
      <ProtectedRoute>
        <TeenHolidayReservations />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wednesday-reservations",
    element: (
      <ProtectedRoute>
        <WednesdayReservations />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin-login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/reservations",
    element: (
      <ProtectedRoute>
        <AdminReservations />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/wednesdays",
    element: (
      <ProtectedRoute>
        <AdminWednesdays />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/holidays",
    element: (
      <ProtectedRoute>
        <AdminHolidays />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/authorized-emails",
    element: (
      <ProtectedRoute>
        <AdminAuthorizedEmails />
      </ProtectedRoute>
    ),
  },
  {
    path: "/terms-of-service",
    element: <TermsOfService />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      <SonnerToaster />
    </QueryClientProvider>
  );
}

export default App;
