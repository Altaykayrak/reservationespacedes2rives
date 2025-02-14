
import { BrowserRouter, Routes, Route } from "react-router-dom"
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

import "./App.css"

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/wednesday-reservations" element={<ProtectedRoute><WednesdayReservations /></ProtectedRoute>} />
          <Route path="/holiday-reservations" element={<ProtectedRoute><HolidayReservations /></ProtectedRoute>} />
          <Route path="/teenholiday-reservations" element={<ProtectedRoute><TeenHolidayReservations /></ProtectedRoute>} />

          <Route path="/admin-login" element={<AdminLogin />} />
        </Routes>
        <Toaster />
        <ShadcnToaster />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
