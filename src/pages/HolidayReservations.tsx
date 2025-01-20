import { HolidayReservationContent } from "@/components/reservations/HolidayReservationContent";
import { CalendarDays } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";

const HolidayReservations = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Réservations vacances
            </h1>
          </div>
          <p className="text-muted-foreground text-base md:text-lg">
            Réservez les périodes de vacances pour vos enfants.
          </p>
        </div>

        <HolidayReservationContent />
      </div>
    </div>
  );
};

export default HolidayReservations;