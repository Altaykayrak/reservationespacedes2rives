
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { Toaster as ShadcnToaster } from "@/components/ui/toaster"
import ErrorBoundary from "@/components/ErrorBoundary"
import Index from "./pages/Index"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import AdminLogin from "./pages/AdminLogin"
import WednesdayReservations from "./pages/WednesdayReservations"
import HolidayReservations from "./pages/HolidayReservations"
import TeenHolidayReservations from "./pages/TeenHolidayReservations"
import { AdminPage } from "./pages/admin/AdminPage"

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
    element: <ProtectedRoute><AdminPage /></ProtectedRoute>,
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
