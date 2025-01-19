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
import { supabase } from "@/integrations/supabase/client";

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

  const validateAndSubmit = async () => {
    console.log("validateAndSubmit called with:", { selectedChild, selectedDates });

    if (!selectedChild) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un enfant.",
        variant: "destructive",
      });
      return;
    }

    const selectedDatesArray = selectedDates.map(d => d.date);
    console.log("Selected dates array:", selectedDatesArray);

    if (!availableHolidays || availableHolidays.length === 0) {
      console.log("No available holidays found");
      return;
    }

    const holidayPeriod = availableHolidays.find(holiday => {
      const startDate = new Date(holiday.start_date);
      const endDate = new Date(holiday.end_date);
      return selectedDatesArray.some(date => 
        date >= startDate && date <= endDate
      );
    });

    console.log("Found holiday period:", holidayPeriod);

    if (!holidayPeriod) {
      toast({
        title: "Erreur",
        description: "Les dates sélectionnées doivent appartenir à une même période de vacances.",
        variant: "destructive",
      });
      return;
    }

    const selectedChildData = children?.find(child => child.id === selectedChild);
    if (!selectedChildData) {
      toast({
        title: "Erreur",
        description: "Impossible de trouver les informations de l'enfant.",
        variant: "destructive",
      });
      return;
    }

    console.log("Validating holiday reservations with:", {
      selectedDatesArray,
      holidayPeriod,
      schoolClass: selectedChildData.school_class
    });

    const validationResult = await validateHolidayReservations(
      selectedDatesArray,
      holidayPeriod,
      selectedChildData.school_class,
      supabase
    );

    console.log("Validation result:", validationResult);

    if (!validationResult.isValid) {
      toast({
        title: "Erreur de validation",
        description: validationResult.message,
        variant: "destructive",
      });
      return;
    }

    const hasConflicts = selectedDates.some(dateOption => 
      isDateReservedForChild(selectedChild, dateOption.date)
    );

    if (hasConflicts) {
      setShowWarningDialog(true);
      return;
    }

    try {
      console.log("Creating reservations...");
      for (const dateOption of selectedDates) {
        const { error } = await supabase
          .from('reservations')
          .insert({
            child_id: selectedChild,
            reservation_date: dateOption.date.toISOString().split('T')[0],
            without_meal: dateOption.withoutMeal,
            early_dropoff: dateOption.earlyDropoff,
            period_id: holidayPeriod.id,
            reservation_number: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          });

        if (error) {
          console.error('Error creating reservation:', error);
          toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la création de la réservation.",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Succès",
        description: "Les réservations ont été créées avec succès.",
      });

      setSelectedDates([]);
      handleSubmit();
    } catch (error) {
      console.error('Error in reservation process:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création des réservations.",
        variant: "destructive",
      });
    }
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
        onSubmit={validateAndSubmit}
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