
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  validateSelectedChild, 
  validateSelectedDates, 
  validateNotAlreadyReserved,
  validateMinimumDays
} from "@/utils/reservationValidationUtils";
import { createHolidayReservations } from "@/utils/reservationCreationUtils";
import { sendHolidayReservationEmail } from "@/utils/emailUtils";
import { Tables } from "@/integrations/supabase/types";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface NoSpotsDialogState {
  isOpen: boolean;
  schoolClass: string;
  date: Date | null;
}

interface MinimumDaysDialogState {
  isOpen: boolean;
}

export const useReservationSubmission = (
  selectedChild: string,
  selectedDates: DateOption[],
  holidayPeriods: Tables<"available_holiday_periods">[] | null | undefined,
  isDateAlreadyReserved: (date: Date) => boolean,
  refetchReservations: () => Promise<any>,
  resetForm: () => void
) => {
  const [noSpotsDialog, setNoSpotsDialog] = useState<NoSpotsDialogState>({
    isOpen: false,
    schoolClass: '',
    date: null
  });

  const [minimumDaysDialog, setMinimumDaysDialog] = useState<MinimumDaysDialogState>({
    isOpen: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Utiliser un état local pour suivre si une soumission est en cours
  const [submissionInProgress, setSubmissionInProgress] = useState<boolean>(false);

  const handleSubmit = async () => {
    const submissionTimestamp = Date.now();
    console.log(`DEBUG: Début de handleSubmit (timestamp: ${submissionTimestamp}) dans useReservationSubmission`);
    
    // Vérifier si une soumission est déjà en cours
    if (submissionInProgress || isSubmitting) {
      console.log(`DEBUG: Une soumission est déjà en cours, abandon (timestamp: ${submissionTimestamp})`);
      return;
    }
    
    try {
      // Marquer le début d'une soumission avec les deux flags
      setSubmissionInProgress(true);
      setIsSubmitting(true);
      
      console.log(`DEBUG: Flags définis - submissionInProgress=true, isSubmitting=true (timestamp: ${submissionTimestamp})`);
      
      // Validation du formulaire
      const childError = validateSelectedChild(selectedChild);
      if (childError) {
        toast({ title: "Erreur", description: childError, variant: "destructive" });
        return;
      }

      const datesError = validateSelectedDates(selectedDates);
      if (datesError) {
        toast({ title: "Erreur", description: datesError, variant: "destructive" });
        return;
      }

      const reservedError = validateNotAlreadyReserved(selectedDates, isDateAlreadyReserved);
      if (reservedError) {
        toast({ title: "Dates déjà réservées", description: reservedError, variant: "destructive" });
        return;
      }

      const isAdminRoute = window.location.pathname.startsWith('/admin/');
      if (!validateMinimumDays(selectedDates, isAdminRoute)) {
        setMinimumDaysDialog({ isOpen: true });
        return;
      }
      
      // Création des réservations
      const result = await createHolidayReservations(
        selectedChild,
        selectedDates,
        holidayPeriods,
        submissionTimestamp
      );

      if (!result.success) {
        if (result.noSpots) {
          // S'assurer que la date est valide
          const safeDate = result.noSpots.date instanceof Date && !isNaN(result.noSpots.date.getTime())
            ? result.noSpots.date
            : null;
            
          setNoSpotsDialog({
            isOpen: true,
            schoolClass: result.noSpots.schoolClass || '',
            date: safeDate
          });
          return;
        }

        if (result.error) {
          toast({
            title: "Erreur",
            description: result.error,
            variant: "destructive",
          });
          return;
        }
      }

      // Si nous avons des réservations réussies, envoyer l'email
      if (result.successfulReservations && result.successfulReservations.length > 0) {
        const childFullName = `${result.childData.first_name} ${result.childData.last_name}`;
        
        await sendHolidayReservationEmail(
          childFullName,
          selectedDates,
          result.periodName || "",
          result.reservationNumber || "",
          result.periodId || "",
          submissionTimestamp,
          result.childData.school_class // Passage de la classe de l'enfant
        );
      }

      toast({
        title: "Réservation confirmée",
        description: "Votre réservation a été enregistrée avec succès.",
      });

      await refetchReservations();
      resetForm();

    } catch (error: any) {
      console.error(`DEBUG: Erreur lors de la création des réservations: ${error.message} (timestamp: ${submissionTimestamp})`);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création des réservations.",
        variant: "destructive",
      });
    } finally {
      // Marquer la fin de la soumission
      setIsSubmitting(false);
      setSubmissionInProgress(false);
      console.log(`DEBUG: Fin de handleSubmit - flags réinitialisés (timestamp: ${submissionTimestamp})`);
    }
  };

  return { 
    handleSubmit,
    noSpotsDialog,
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog,
    isSubmitting
  };
};
