
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { Toaster as ShadcnToaster } from "@/components/ui/toaster"
import ErrorBoundary from "@/components/ErrorBoundary"
import Index from "./pages/Index"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import Children from "./pages/Children"
import { ProtectedRoute } from "./components/ProtectedRoute"
import AdminLogin from "./pages/AdminLogin"
import WednesdayReservations from "./pages/WednesdayReservations"
import HolidayReservations from "./pages/HolidayReservations"
import TeenHolidayReservations from "./pages/TeenHolidayReservations"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminWednesdays from "./pages/admin/AdminWednesdays"
import AdminHolidays from "./pages/admin/AdminHolidays"
import AdminReservations from "./pages/admin/AdminReservations"
import AdminAuthorizedEmails from "./pages/admin/AdminAuthorizedEmails"

import "./App.css"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/children",
    element: <ProtectedRoute><Children /></ProtectedRoute>,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/wednesday-reservations",
    element: <ProtectedRoute><WednesdayReservations /></ProtectedRoute>,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/holiday-reservations",
    element: <ProtectedRoute><HolidayReservations /></ProtectedRoute>,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/teenholiday-reservations",
    element: <ProtectedRoute><TeenHolidayReservations /></ProtectedRoute>,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/admin-login",
    element: <AdminLogin />,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/admin",
    element: <ProtectedRoute><AdminDashboard /></ProtectedRoute>,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/admin/wednesdays",
    element: <ProtectedRoute><AdminWednesdays /></ProtectedRoute>,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/admin/holidays",
    element: <ProtectedRoute><AdminHolidays /></ProtectedRoute>,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/admin/reservations",
    element: <ProtectedRoute><AdminReservations /></ProtectedRoute>,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/admin/authorized-emails",
    element: <ProtectedRoute><AdminAuthorizedEmails /></ProtectedRoute>,
    errorElement: <ErrorBoundary />
  }
])

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
      <ShadcnToaster />
    </>
  )
}

export default App
