import { HolidayReservationContent } from "@/components/reservations/HolidayReservationContent";
import { Navbar } from "@/components/ui/navbar";

const HolidayReservations = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4 space-y-8">
        <h1 className="text-2xl font-bold mb-6">Réservations de vacances</h1>
        <HolidayReservationContent />
      </div>
    </div>
  );
};

export default HolidayReservations;