import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminLogin from "@/pages/AdminLogin";
import Profile from "@/pages/Profile";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminWednesdays from "@/pages/admin/AdminWednesdays";
import AdminHolidays from "@/pages/admin/AdminHolidays";
import AdminReservations from "@/pages/admin/AdminReservations";
import AdminAuthorizedEmails from "@/pages/admin/AdminAuthorizedEmails";
import Reservations from "@/pages/Reservations";
import HolidayReservations from "@/pages/HolidayReservations";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/reservations",
    element: (
      <ProtectedRoute>
        <Reservations />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/holiday-reservations",
    element: (
      <ProtectedRoute>
        <HolidayReservations />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin-login",
    element: <AdminLogin />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/wednesdays",
    element: (
      <ProtectedRoute>
        <AdminWednesdays />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/holidays",
    element: (
      <ProtectedRoute>
        <AdminHolidays />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/reservations",
    element: (
      <ProtectedRoute>
        <AdminReservations />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/authorized-emails",
    element: (
      <ProtectedRoute>
        <AdminAuthorizedEmails />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
      <SonnerToaster position="top-center" />
    </>
  );
}

export default App;