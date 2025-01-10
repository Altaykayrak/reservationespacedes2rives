import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminLogin from "@/pages/AdminLogin";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminWednesdays from "@/pages/admin/AdminWednesdays";
import AdminHolidays from "@/pages/admin/AdminHolidays";
import AdminReservations from "@/pages/admin/AdminReservations";
import AdminAuthorizedEmails from "@/pages/admin/AdminAuthorizedEmails";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
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
    path: "/admin/reservations",
    element: (
      <ProtectedRoute>
        <AdminReservations />
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