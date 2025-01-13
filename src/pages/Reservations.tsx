import { ReservationCalendar } from "@/components/reservations/ReservationCalendar";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { ReservationsList } from "@/components/reservations/ReservationsList";
import { useReservations } from "@/hooks/useReservations";
import { CalendarDays } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";

const Reservations = () => {
  const {
    selectedDates,
    setSelectedDates,
    selectedChild,
    setSelectedChild,
    children,
    reservations,
    handleSubmit,
    isSubmitting
  } = useReservations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Réservations
            </h1>
          </div>
          <p className="text-muted-foreground text-base md:text-lg">
            Gérez vos réservations pour les mercredis et consultez l'historique de vos réservations.
          </p>
        </div>

        <div className="space-y-4 md:space-y-8">
          <div className="space-y-4 md:space-y-8">
            <div className="bg-white rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100 overflow-hidden">
              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Sélectionnez le(s) mercredi(s) que vous souhaitez réserver :</h2>
                <ReservationCalendar
                  selectedDates={selectedDates.map(d => d.date)}
                  setSelectedDates={dates => setSelectedDates(dates.map(date => ({
                    date,
                    withoutMeal: false,
                    earlyDropoff: false,
                  })))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-8">
            <div className="bg-white rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100 overflow-hidden">
              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Indiquez les détails de la réservation</h2>
                <ReservationForm
                  selectedDates={selectedDates.map(d => d.date)}
                  children={children}
                  selectedChild={selectedChild}
                  setSelectedChild={setSelectedChild}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  setSelectedDates={setSelectedDates}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100 overflow-hidden">
          <div className="p-4 md:p-6">
            <ReservationsList reservations={reservations} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservations;