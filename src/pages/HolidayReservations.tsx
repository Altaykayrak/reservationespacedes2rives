import { HolidayReservationCalendar } from "@/components/reservations/HolidayReservationCalendar";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { ReservationsList } from "@/components/reservations/ReservationsList";
import { useReservations } from "@/hooks/useReservations";
import { validateHolidayReservations } from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";

const HolidayReservations = () => {
  const { toast } = useToast();
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

  const handleValidatedSubmit = () => {
    const validation = validateHolidayReservations(selectedDates.map(d => d.date));
    
    if (!validation.isValid) {
      toast({
        title: "Erreur de validation",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    handleSubmit();
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Réservations de vacances</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <HolidayReservationCalendar
          selectedDates={selectedDates.map(d => d.date)}
          setSelectedDates={dates => setSelectedDates(dates.map(date => ({
            date,
            withoutMeal: false,
            earlyDropoff: false,
          })))}
        />
        <ReservationForm
          selectedDates={selectedDates.map(d => d.date)}
          children={children}
          selectedChild={selectedChild}
          setSelectedChild={setSelectedChild}
          onSubmit={handleValidatedSubmit}
          isSubmitting={isSubmitting}
        />
      </div>

      <ReservationsList reservations={reservations} />
    </div>
  );
};

export default HolidayReservations;