
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

const router = createBrowserRouter([
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
