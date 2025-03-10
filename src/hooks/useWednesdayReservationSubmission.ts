
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useWednesdayReservationSubmission = (
  selectedChild: string,
  selectedDates: DateOption[],
  isDateAlreadyReserved: (date: Date) => boolean,
  refetchReservations: () => Promise<any>,
  resetForm: () => void
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleSubmit = async () => {
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

    try {
      // Récupérer les informations de l'enfant
      const { data: childData, error: childError } = await supabase
        .from("children")
        .select("first_name, last_name")
        .eq("id", selectedChild)
        .single();

      if (childError) throw childError;

      for (const dateOption of selectedDates) {
        const { data: wednesday, error: wednesdayError } = await supabase
          .from("available_wednesdays")
          .select("id")
          .eq("date", format(dateOption.date, "yyyy-MM-dd"))
          .maybeSingle();

        if (wednesdayError) throw wednesdayError;
        if (!wednesday) throw new Error(`Mercredi non trouvé pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);

        const { data: existingReservation } = await supabase
          .from("wednesday_reservations")
          .select("id")
          .eq("child_id", selectedChild)
          .eq("wednesday_id", wednesday.id)
          .maybeSingle();

        if (existingReservation) {
          console.log(`Réservation déjà existante pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);
          continue;
        }

        const { error: reservationError } = await supabase
          .from("wednesday_reservations")
          .insert({
            child_id: selectedChild,
            wednesday_id: wednesday.id,
            without_meal: dateOption.withoutMeal,
            early_dropoff: dateOption.earlyDropoff,
            status: 'confirmed',
            reservation_number: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          });

        if (reservationError) throw reservationError;
      }

      // Envoyer l'email de confirmation
      const childFullName = `${childData.first_name} ${childData.last_name}`;
      const formattedDates = selectedDates.map(d => format(d.date, "EEEE d MMMM yyyy", { locale: fr }));
      
      // Add a unique requestId to prevent duplicate emails
      const requestId = `wednesday-${childFullName}-${Date.now()}`;
      
      await supabase.functions.invoke('send-reservation-email', {
        body: {
          childName: childFullName,
          dates: formattedDates,
          reservationType: 'wednesday',
          withoutMeal: selectedDates.map(d => d.withoutMeal),
          earlyDropoff: selectedDates.map(d => d.earlyDropoff),
          requestId
        }
      });

      // Forcer la mise à jour des données après les réservations
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["available_wednesdays"] }),
        refetchReservations()
      ]);

      setShowSuccessDialog(true);
      resetForm();

    } catch (error: any) {
      console.error("Erreur lors de la création des réservations:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création des réservations.",
        variant: "destructive",
      });
    }
  };

  return { 
    handleSubmit, 
    showSuccessDialog, 
    setShowSuccessDialog 
  };
};
