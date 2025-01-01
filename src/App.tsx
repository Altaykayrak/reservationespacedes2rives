import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Reservations from "./pages/Reservations";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminWednesdays from "./pages/admin/AdminWednesdays";
import AdminHolidays from "./pages/admin/AdminHolidays";
import AdminReservations from "./pages/admin/AdminReservations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/children" element={<div>Page Enfants (à venir)</div>} />
          <Route path="/reservations" element={<Reservations />} />
          
          {/* Routes d'administration */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/wednesdays" element={<AdminWednesdays />} />
          <Route path="/admin/holidays" element={<AdminHolidays />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;