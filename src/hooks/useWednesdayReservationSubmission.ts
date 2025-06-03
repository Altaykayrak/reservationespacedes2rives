
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [excludedFullDates, setExcludedFullDates] = useState<Date[]>([]);

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

    setIsSubmitting(true);

    try {
      // Récupérer les informations de l'enfant pour vérifier sa classe
      const { data: childData, error: childError } = await supabase
        .from("children")
        .select("first_name, last_name, school_class")
        .eq("id", selectedChild)
        .single();

      if (childError) throw childError;

      const isKindergarten = ["PS", "MS", "GS"].includes(childData.school_class);
      const isPrimary = ["CP", "CE1", "CE2", "CM1", "CM2"].includes(childData.school_class);

      // Vérifier les places disponibles pour chaque date et séparer les dates disponibles des complètes
      const availableDates: DateOption[] = [];
      const fullDates: Date[] = [];
      
      for (const dateOption of selectedDates) {
        const { data: wednesday, error: wednesdayError } = await supabase
          .from("available_wednesdays")
          .select("id")
          .eq("date", format(dateOption.date, "yyyy-MM-dd"))
          .maybeSingle();

        if (wednesdayError) throw wednesdayError;
        if (!wednesday) throw new Error(`Mercredi non trouvé pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);

        // Vérifier les places restantes selon la classe de l'enfant
        let spotsRemaining = 0;
        if (isKindergarten) {
          const { data: kindergartenSpots, error: spotsError } = await supabase
            .rpc('check_wednesday_spots_remaining', {
              wednesday_id: wednesday.id,
              child_school_class: 'MS'
            });
          
          if (spotsError) throw spotsError;
          spotsRemaining = kindergartenSpots || 0;
        } else if (isPrimary) {
          const { data: primarySpots, error: spotsError } = await supabase
            .rpc('check_wednesday_spots_remaining', {
              wednesday_id: wednesday.id,
              child_school_class: 'CP'
            });
          
          if (spotsError) throw spotsError;
          spotsRemaining = primarySpots || 0;
        }

        console.log(`Places restantes pour le mercredi ${format(dateOption.date, "dd/MM/yyyy")}:`, spotsRemaining);

        if (spotsRemaining <= 0) {
          fullDates.push(dateOption.date);
        } else {
          availableDates.push(dateOption);
        }
      }

      // Si toutes les dates sont complètes, afficher un message d'erreur
      if (availableDates.length === 0) {
        const fullDatesText = fullDates
          .map(date => date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          }))
          .join(', ');

        toast({
          title: "Aucune réservation possible",
          description: `Tous les mercredis sélectionnés sont complets : ${fullDatesText}. Vous pouvez contacter l'accueil pour être mis en liste d'attente.`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Stocker les dates complètes pour les afficher dans le dialog de succès
      setExcludedFullDates(fullDates);

      // Procéder aux réservations pour les dates disponibles uniquement
      for (const dateOption of availableDates) {
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

      // Envoyer l'email de confirmation seulement pour les dates effectivement réservées
      const childFullName = `${childData.first_name} ${childData.last_name}`;
      const formattedDates = availableDates.map(d => format(d.date, "EEEE d MMMM yyyy", { locale: fr }));
      
      // Add a unique requestId to prevent duplicate emails
      const requestId = `wednesday-${childFullName}-${Date.now()}`;
      
      await supabase.functions.invoke('send-reservation-email', {
        body: {
          childName: childFullName,
          dates: formattedDates,
          reservationType: 'wednesday',
          withoutMeal: availableDates.map(d => d.withoutMeal),
          earlyDropoff: availableDates.map(d => d.earlyDropoff),
          requestId
        }
      });

      // Forcer la mise à jour des données après les réservations
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["available_wednesdays"] }),
        queryClient.invalidateQueries({ queryKey: ["wednesday_reservations"] }),
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    handleSubmit, 
    showSuccessDialog, 
    setShowSuccessDialog,
    isSubmitting,
    excludedFullDates
  };
};
