
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { validateMinimumDaysPerWeek } from "@/utils/dateUtils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface NoSpotsDialogState {
  isOpen: boolean;
  schoolClass: string;
  date: Date;
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
    date: new Date()
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
      
      if (!selectedChild) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un enfant.",
          variant: "destructive",
        });
        return;
      }

      if (selectedDates.length === 0) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner au moins une date.",
          variant: "destructive",
        });
        return;
      }

      const alreadyReservedDates = selectedDates.filter(dateOption => 
        isDateAlreadyReserved(dateOption.date)
      );

      if (alreadyReservedDates.length > 0) {
        const datesList = alreadyReservedDates
          .map(d => format(d.date, "d MMMM yyyy", { locale: fr }))
          .join(", ");
        
        toast({
          title: "Dates déjà réservées",
          description: `Les dates suivantes sont déjà réservées pour cet enfant : ${datesList}`,
          variant: "destructive",
        });
        return;
      }

      const isAdminRoute = window.location.pathname.startsWith('/admin/');

      if (!validateMinimumDaysPerWeek(selectedDates.map(d => d.date), isAdminRoute)) {
        setMinimumDaysDialog({ isOpen: true });
        return;
      }
      
      try {
        const { data: childData, error: childError } = await supabase
          .from("children")
          .select("first_name, last_name, school_class")
          .eq("id", selectedChild)
          .single();

        if (childError) throw childError;

        // Récupérer les informations de période pour l'email
        let periodName = "";
        let periodId = "";
        if (holidayPeriods && selectedDates.length > 0) {
          const firstDate = selectedDates[0].date;
          const period = holidayPeriods.find(period => {
            const startDate = new Date(period.start_date);
            const endDate = new Date(period.end_date);
            return firstDate >= startDate && firstDate <= endDate;
          });
          
          if (period) {
            periodId = period.id;
            periodName = `${format(new Date(period.start_date), "d MMMM yyyy", { locale: fr })} au ${format(new Date(period.end_date), "d MMMM yyyy", { locale: fr })}`;
            console.log(`DEBUG: Période identifiée: ${periodName}, ID: ${periodId} (timestamp: ${submissionTimestamp})`);
          }
        }

        // Generate a unique reservation number for this batch
        const reservationNumber = `HOL-${Date.now().toString().substring(5)}`;
        console.log(`DEBUG: Numéro de réservation généré: ${reservationNumber} (timestamp: ${submissionTimestamp})`);

        // Store successful reservations
        const successfulReservations = [];

        // Check available spots for each date and create reservations
        for (const dateOption of selectedDates) {
          const dateStr = format(dateOption.date, "yyyy-MM-dd");
          console.log(`DEBUG: Traitement de la date ${dateStr} (timestamp: ${submissionTimestamp})`);
          
          // Find the period for this date
          const period = holidayPeriods?.find(period => {
            const startDate = new Date(period.start_date);
            const endDate = new Date(period.end_date);
            const currentDate = new Date(dateStr);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);
            return currentDate >= startDate && currentDate <= endDate;
          });

          if (!period) {
            throw new Error(`Période non trouvée pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);
          }

          // Check if there are spots available
          const { data: spotsLeft, error: spotsError } = await supabase
            .rpc('check_holiday_spots_available', {
              period_id: period.id,
              reservation_date: dateStr,
              child_school_class: childData.school_class
            });

          if (spotsError) throw spotsError;

          if (spotsLeft <= 0) {
            setNoSpotsDialog({
              isOpen: true,
              schoolClass: childData.school_class,
              date: dateOption.date
            });
            console.log(`DEBUG: Pas de places disponibles pour ${dateStr} (timestamp: ${submissionTimestamp})`);
            return;
          }

          // Check if reservation already exists
          const { data: existingReservation, error: checkError } = await supabase
            .from("holiday_reservations")
            .select()
            .eq("child_id", selectedChild)
            .eq("period_id", period.id)
            .eq("reservation_date", dateStr)
            .maybeSingle();

          if (checkError) throw checkError;

          if (existingReservation) {
            throw new Error(`Une réservation existe déjà pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);
          }

          // Create the reservation in the database
          console.log(`DEBUG: Création de la réservation dans la base de données pour la date ${dateStr} (timestamp: ${submissionTimestamp})`);
          const { data: insertedReservation, error: insertError } = await supabase
            .from("holiday_reservations")
            .insert({
              child_id: selectedChild,
              period_id: period.id,
              reservation_date: dateStr,
              reservation_number: reservationNumber,
              without_meal: dateOption.withoutMeal,
              early_dropoff: dateOption.earlyDropoff,
              status: "confirmed"
            })
            .select()
            .single();

          if (insertError) throw insertError;
          
          console.log(`DEBUG: Réservation créée avec succès pour la date ${dateStr}, ID: ${insertedReservation?.id} (timestamp: ${submissionTimestamp})`);
          
          if (insertedReservation) {
            successfulReservations.push(insertedReservation);
          }
        }

        if (successfulReservations.length > 0) {
          // Send notification email - une seule fois après toutes les insertions
          const childFullName = `${childData.first_name} ${childData.last_name}`;
          const formattedDates = selectedDates.map(d => format(d.date, "EEEE d MMMM yyyy", { locale: fr }));
          
          // Créer un requestId unique qui inclut toutes les informations pertinentes
          const requestId = `holiday-${childFullName}-${reservationNumber}-${periodId}-${submissionTimestamp}`;
          console.log(`DEBUG: Envoi d'email avec requestId: ${requestId} (timestamp: ${submissionTimestamp})`);
          
          const emailResponse = await supabase.functions.invoke('send-reservation-email', {
            body: {
              childName: childFullName,
              dates: formattedDates,
              reservationType: 'holiday',
              withoutMeal: selectedDates.map(d => d.withoutMeal),
              earlyDropoff: selectedDates.map(d => d.earlyDropoff),
              period: periodName,
              requestId
            }
          });
          
          console.log(`DEBUG: Réponse de l'email: ${JSON.stringify(emailResponse)} (timestamp: ${submissionTimestamp})`);
        } else {
          console.error(`DEBUG: Aucune réservation n'a été créée avec succès (timestamp: ${submissionTimestamp})`);
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
      }
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
