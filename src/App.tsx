import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HolidayReservationContent } from "@/components/reservations/HolidayReservationContent";
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
    path: "/holiday-reservations",
    element: <HolidayReservationContent />,
  },
  {
    path: "/wednesday-reservations",
    element: <WednesdayReservations />,
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