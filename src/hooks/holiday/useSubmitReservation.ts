
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { createHolidayReservations } from "@/utils/reservationCreationUtils";
import { sendHolidayReservationEmail } from "@/utils/emailUtils";
import { useHolidayReservations } from "../useHolidayReservations";
import { useExistingHolidayReservations } from "../useExistingHolidayReservations";
import { validateMinimumDays } from "@/utils/reservationValidationUtils";
import { eventBus } from "@/lib/utils";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useSubmitReservation = (
  selectedChild: string | null,
  selectedDates: DateOption[],
  selectedPeriod: string | null,
  holidayPeriods: Tables<"available_holiday_periods">[] | null | undefined,
  setSelectedDates: (dates: DateOption[]) => void,
  setShowSuccessDialog: (show: boolean) => void,
  setNoSpotsDialog: (dialog: { isOpen: boolean, schoolClass: string, date: Date }) => void,
  setMinimumDaysDialog: (dialog: { isOpen: boolean }) => void,
  setIsSubmitting: (isSubmitting: boolean) => void,
) => {
  const { toast } = useToast();
  const { refetch: refetchReservations } = useHolidayReservations();
  const { refetchReservations: refetchChildReservations } = useExistingHolidayReservations(selectedChild || "");
  
  const handleSubmit = async () => {
    if (!selectedChild || !selectedPeriod || selectedDates.length === 0) return;
    
    // Generate a timestamp to trace this specific submission
    const submissionTimestamp = Date.now();
    console.log(`DEBUG: handleSubmit called - timestamp: ${submissionTimestamp}`);
    console.log(`DEBUG: selectedDates.length = ${selectedDates.length}`);
    
    setIsSubmitting(true);
    
    try {
      // Détection de la route administrative
      const isAdminRoute = window.location.pathname.includes('/admin/');
      console.log("DEBUG: isAdminRoute détecté:", isAdminRoute, "pour pathname:", window.location.pathname);
      
      // Vérifier ici si les dates sélectionnées respectent la règle des 3 jours minimum
      const hasMinimumDays = validateMinimumDays(selectedDates, isAdminRoute);
      console.log(`DEBUG: Résultat validation minimum jours: ${hasMinimumDays}`);
      
      if (!hasMinimumDays) {
        console.log("DEBUG: Validation des jours minimum échouée, affichage du dialogue");
        setMinimumDaysDialog({ isOpen: true });
        setIsSubmitting(false);
        return;
      }
      
      // Create the reservations
      const result = await createHolidayReservations(
        selectedChild, 
        selectedDates, 
        holidayPeriods,
        submissionTimestamp
      );
      
      if (result.success) {
        setSelectedDates([]);
        
        // Send the confirmation email
        try {
          console.log(`DEBUG: Sending confirmation email - timestamp: ${submissionTimestamp}`);
          const childFullName = `${result.childData?.first_name} ${result.childData?.last_name}`;
          const childSchoolClass = result.childData?.school_class || "";
          
          const emailResult = await sendHolidayReservationEmail(
            childFullName,
            selectedDates,
            result.periodName || "",
            result.reservationNumber || "",
            result.periodId || "",
            submissionTimestamp,
            childSchoolClass
          );
          
          console.log(`DEBUG: Email result:`, emailResult, `- timestamp: ${submissionTimestamp}`);
        } catch (emailError) {
          console.error(`DEBUG: Error sending email: ${emailError} - timestamp: ${submissionTimestamp}`);
          // Don't fail the whole operation if just the email fails
        }
        
        // Refresh reservations data
        await refetchReservations();
        await refetchChildReservations();
        
        // Notify components that a reservation was made
        eventBus.publish('holiday-reservation-created', { 
          child_id: selectedChild,
          dates: selectedDates.map(d => d.date)
        });
        
        setShowSuccessDialog(true);
      } else if (result.noSpots) {
        setNoSpotsDialog({
          isOpen: true,
          schoolClass: result.noSpots.schoolClass,
          date: result.noSpots.date,
        });
      } else {
        console.error(`DEBUG: Error creating reservations: ${result.error} - timestamp: ${submissionTimestamp}`);
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors de la création des réservations.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(`DEBUG: Unexpected error in handleSubmit: ${error.message} - timestamp: ${submissionTimestamp}`);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création des réservations.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit };
};
