import { ReservationCalendar } from "@/components/reservations/ReservationCalendar";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { ReservationsList } from "@/components/reservations/ReservationsList";
import { useReservations } from "@/hooks/useReservations";
import { Separator } from "@/components/ui/separator";

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
    <div className="container mx-auto p-4 space-y-8 max-w-7xl">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Réservations</h1>
        <p className="text-muted-foreground">
          Gérez vos réservations pour les mercredis et consultez l'historique de vos réservations.
        </p>
      </div>

      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Sélection des dates</h2>
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

        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Détails de la réservation</h2>
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

      <Separator className="my-6" />

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <ReservationsList reservations={reservations} />
      </div>
    </div>
  );
};

export default Reservations;