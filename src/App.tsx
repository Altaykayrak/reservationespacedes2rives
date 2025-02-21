
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AdminPage } from "@/pages/admin/AdminPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminWednesdays from "@/pages/admin/AdminWednesdays";
import AdminHolidays from "@/pages/admin/AdminHolidays";
import AdminReservations from "@/pages/admin/AdminReservations";
import AdminChildren from "@/pages/admin/AdminChildren";
import AdminChildReservations from "@/pages/admin/AdminChildReservations";
import AdminAuthorizedEmails from "@/pages/admin/AdminAuthorizedEmails";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminNewReservation from "@/pages/admin/AdminNewReservation";
import AdminNewHolidayReservation from "@/pages/admin/AdminNewHolidayReservation";
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
  {
    path: "/holiday-program",
    element: <HolidayProgram />,
  },
  {
    path: "/terms-of-service",
    element: <TermsOfService />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
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
        path: "reservations/new",
        element: <AdminNewReservation />,
      },
      {
        path: "reservations/new-holiday",
        element: <AdminNewHolidayReservation />,
      },
      {
        path: "children",
        element: <AdminChildren />,
      },
      {
        path: "children/:childId/reservations",
        element: <AdminChildReservations />,
      },
      {
        path: "authorized-emails",
        element: <AdminAuthorizedEmails />,
      },
    ],
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
