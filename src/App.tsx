
import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Children from "@/pages/Children";
import WednesdayReservations from "@/pages/WednesdayReservations";
import HolidayReservations from "@/pages/HolidayReservations";
import TeenHolidayReservations from "@/pages/TeenHolidayReservations";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import TermsOfService from "@/pages/TermsOfService";
import HolidayProgram from "@/pages/HolidayProgram";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminPage from "@/pages/admin/AdminPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminWednesdays from "@/pages/admin/AdminWednesdays";
import AdminHolidays from "@/pages/admin/AdminHolidays";
import AdminReservations from "@/pages/admin/AdminReservations";
import AdminAuthorizedEmails from "@/pages/admin/AdminAuthorizedEmails";
import AdminNewReservation from "@/pages/admin/AdminNewReservation";
import AdminNewHolidayReservation from "@/pages/admin/AdminNewHolidayReservation";
import AdminNewTeenHolidayReservation from "@/pages/admin/AdminNewTeenHolidayReservation";
import AdminProfiles from "@/pages/admin/AdminProfiles";
import AdminChildren from "@/pages/admin/AdminChildren";

/**
 * Auth Protected Route
 */
const ProtectedRoute = ({
  children,
  redirectTo,
}: {
  children: React.ReactNode;
  redirectTo: string;
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo]);

  return user ? <>{children}</> : null;
};

/**
 * Layout with Toaster
 */
const ToasterLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout>
      {children}
      <Toaster />
    </Layout>
  );
};

/**
 * Application Routes
 */
const router = createBrowserRouter([
  {
    element: <ToasterLayout children={<></>} />,
    children: [
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
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/terms-of-service",
        element: <TermsOfService />,
      },
      {
        path: "/holiday-program",
        element: <HolidayProgram />,
      },
      // Auth protected routes
      {
        element: <ProtectedRoute redirectTo="/login" children={<></>} />,
        children: [
          {
            path: "/profile",
            element: <Profile />,
          },
          {
            path: "/children",
            element: <Children />,
          },
          {
            path: "/wednesday-reservations",
            element: <WednesdayReservations />,
          },
          {
            path: "/holiday-reservations",
            element: <HolidayReservations />,
          },
          {
            path: "/teenholiday-reservations",
            element: <TeenHolidayReservations />,
          },
        ],
      },
      // Admin routes
      {
        path: "/admin-login",
        element: <AdminLoginPage />,
      },
      {
        path: "/admin",
        element: <AdminPage />,
        children: [
          {
            path: "",
            element: <AdminDashboard />,
          },
          {
            path: "wednesdays",
            element: <AdminWednesdays />,
          },
          {
            path: "holidays",
            element: <AdminHolidays />,
          },
          {
            path: "reservations",
            element: <AdminReservations />,
          },
          {
            path: "profiles",
            element: <AdminProfiles />,
          },
          {
            path: "children",
            element: <AdminChildren />,
          },
          {
            path: "authorized-emails",
            element: <AdminAuthorizedEmails />,
          },
          {
            path: "new-reservation",
            element: <AdminNewReservation />,
          },
          {
            path: "new-holiday-reservation",
            element: <AdminNewHolidayReservation />,
          },
          {
            path: "new-teen-holiday-reservation",
            element: <AdminNewTeenHolidayReservation />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
