import { HolidayReservationCalendar } from "./HolidayReservationCalendar";
import { ReservationForm } from "./ReservationForm";
import { ReservationsList } from "./ReservationsList";
import { MinimumDaysDialog } from "./dialogs/MinimumDaysDialog";
import { ReservationWarningDialog } from "./dialogs/ReservationWarningDialog";
import { useReservations } from "@/hooks/useReservations";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { validateHolidayReservations } from "@/utils/dateUtils";
import { getWeeksFromDates } from "@/utils/dateUtils";

export const HolidayReservationContent = () => {
  const { toast } = useToast();
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showMinDaysDialog, setShowMinDaysDialog] = useState(false);
  
  const {
    selectedDates,
    setSelectedDates,
    selectedChild,
    setSelectedChild,
    children,
    reservations,
    handleSubmit,
    isSubmitting,
    isDateReservedForChild
  } = useReservations();

  const handleValidatedSubmit = () => {
    // Vérifier si toutes les semaines ont au moins 3 jours sélectionnés
    const weeks = getWeeksFromDates(selectedDates.map(d => d.date));
    const hasInvalidWeek = weeks.some(weekDates => weekDates.length < 3);

    if (hasInvalidWeek) {
      setShowMinDaysDialog(true);
      return;
    }

    // Récupérer les dates déjà réservées pour cet enfant
    const existingReservations = reservations
      ?.filter(res => res.child_id === selectedChild)
      .map(res => new Date(res.reservation_date)) || [];

    const validation = validateHolidayReservations(
      selectedDates.map(d => d.date),
      existingReservations
    );
    
    if (!validation.isValid) {
      toast({
        title: "Erreur de validation",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    // Vérifier si des dates sont déjà réservées pour cet enfant
    const hasConflicts = selectedDates.some(dateOption => 
      isDateReservedForChild(selectedChild, dateOption.date)
    );

    if (hasConflicts) {
      setShowWarningDialog(true);
      return;
    }

    handleSubmit();
  };

  return (
    <div className="space-y-4 md:space-y-8">
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
        setSelectedDates={setSelectedDates}
      />
      <ReservationsList reservations={reservations} />

      <ReservationWarningDialog 
        open={showWarningDialog} 
        onOpenChange={setShowWarningDialog} 
      />
      
      <MinimumDaysDialog 
        open={showMinDaysDialog} 
        onOpenChange={setShowMinDaysDialog} 
      />
    </div>
  );
};