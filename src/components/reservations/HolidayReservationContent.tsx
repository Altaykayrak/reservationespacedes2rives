import { HolidayReservationCalendar } from "./HolidayReservationCalendar";
import { ReservationForm } from "./ReservationForm";
import { ReservationsList } from "./ReservationsList";
import { MinimumDaysDialog } from "./dialogs/MinimumDaysDialog";
import { ReservationWarningDialog } from "./dialogs/ReservationWarningDialog";
import { useReservations } from "@/hooks/useReservations";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { validateHolidayReservations } from "@/utils/dateUtils";
import { useAvailableDates } from "@/hooks/useAvailableDates";

export const HolidayReservationContent = () => {
  const { toast } = useToast();
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showMinDaysDialog, setShowMinDaysDialog] = useState(false);
  const { availableHolidays } = useAvailableDates();
  
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
    if (!selectedChild) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un enfant.",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si les dates sélectionnées appartiennent à une seule période de vacances
    if (!availableHolidays || availableHolidays.length === 0) {
      return;
    }

    const selectedDatesArray = selectedDates.map(d => d.date);
    const holidayPeriod = availableHolidays.find(holiday => {
      const startDate = new Date(holiday.start_date);
      const endDate = new Date(holiday.end_date);
      return selectedDatesArray.every(date => 
        date >= startDate && date <= endDate
      );
    });

    if (!holidayPeriod) {
      toast({
        title: "Erreur",
        description: "Les dates sélectionnées doivent appartenir à une même période de vacances.",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si au moins 3 jours sont sélectionnés pour la période
    if (selectedDatesArray.length < 3) {
      setShowMinDaysDialog(true);
      return;
    }

    // Récupérer les dates déjà réservées pour cet enfant
    const existingReservations = reservations
      ?.filter(res => res.child_id === selectedChild)
      .map(res => new Date(res.reservation_date)) || [];

    const validation = validateHolidayReservations(
      selectedDatesArray,
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