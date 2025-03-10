
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
  
  // Ajouter une référence pour éviter les doubles appels
  const submissionInProgress = useState<boolean>(false);

  const handleSubmit = async () => {
    console.log("DEBUG: Début de handleSubmit dans useReservationSubmission");
    
    // Vérifier si une soumission est déjà en cours
    if (submissionInProgress[0]) {
      console.log("DEBUG: Une soumission est déjà en cours, abandon");
      return;
    }
    
    // Marquer le début d'une soumission
    submissionInProgress[0] = true;
    
    try {
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

      setIsSubmitting(true);
      
      try {
        const { data: childData, error: childError } = await supabase
          .from("children")
          .select("first_name, last_name, school_class")
          .eq("id", selectedChild)
          .single();

        if (childError) throw childError;

        // Generate a unique reservation number for this batch
        const reservationNumber = `HOL-${Date.now().toString().substring(5)}`;
        console.log("DEBUG: Numéro de réservation généré:", reservationNumber);

        // Check available spots for each date and create reservations
        for (const dateOption of selectedDates) {
          const dateStr = format(dateOption.date, "yyyy-MM-dd");
          console.log("DEBUG: Traitement de la date", dateStr);
          
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
            setIsSubmitting(false);
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
          console.log("DEBUG: Création de la réservation dans la base de données pour la date", dateStr);
          const { error: insertError } = await supabase
            .from("holiday_reservations")
            .insert({
              child_id: selectedChild,
              period_id: period.id,
              reservation_date: dateStr,
              reservation_number: reservationNumber,
              without_meal: dateOption.withoutMeal,
              early_dropoff: dateOption.earlyDropoff,
              status: "confirmed"
            });

          if (insertError) throw insertError;
          console.log("DEBUG: Réservation créée avec succès pour la date", dateStr);
        }

        // Send notification email - une seule fois après toutes les insertions
        const childFullName = `${childData.first_name} ${childData.last_name}`;
        const formattedDates = selectedDates.map(d => format(d.date, "EEEE d MMMM yyyy", { locale: fr }));
        
        const requestId = `holiday-${childFullName}-${Date.now()}`;
        console.log("DEBUG: Envoi d'email avec requestId:", requestId);
        
        await supabase.functions.invoke('send-reservation-email', {
          body: {
            childName: childFullName,
            dates: formattedDates,
            reservationType: 'holiday',
            withoutMeal: selectedDates.map(d => d.withoutMeal),
            earlyDropoff: selectedDates.map(d => d.earlyDropoff),
            requestId
          }
        });

        console.log("DEBUG: Email envoyé avec succès");
        
        toast({
          title: "Réservation confirmée",
          description: "Votre réservation a été enregistrée avec succès.",
        });

        await refetchReservations();
        resetForm();

      } catch (error: any) {
        console.error("Erreur lors de la création des réservations:", error);
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors de la création des réservations.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } finally {
      // Marquer la fin de la soumission
      submissionInProgress[0] = false;
    }
    
    console.log("DEBUG: Fin de handleSubmit dans useReservationSubmission");
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
