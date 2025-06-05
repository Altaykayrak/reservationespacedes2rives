
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
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  const handleSubmit = async () => {
    console.log("=== DÉBUT DE LA SOUMISSION ===");
    
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
    setProgress(0);
    setProgressMessage("Initialisation...");

    try {
      // Étape 1: Récupérer les informations de l'enfant
      setProgress(20);
      setProgressMessage("Récupération des informations de l'enfant...");
      
      const { data: childData, error: childError } = await supabase
        .from("children")
        .select("first_name, last_name, school_class")
        .eq("id", selectedChild)
        .single();

      if (childError) throw childError;

      console.log("Enfant sélectionné:", childData.first_name, childData.last_name, "Classe:", childData.school_class);

      const isKindergarten = ["PS", "MS", "GS"].includes(childData.school_class);
      const isPrimary = ["CP", "CE1", "CE2", "CM1", "CM2"].includes(childData.school_class);

      // Étape 2: Vérifier les places disponibles
      setProgress(40);
      setProgressMessage("Vérification des places disponibles...");
      
      const availableDates: DateOption[] = [];
      const fullDates: Date[] = [];
      
      console.log("Vérification des places pour", selectedDates.length, "dates sélectionnées");

      for (const dateOption of selectedDates) {
        console.log("Vérification de la date:", format(dateOption.date, "dd/MM/yyyy"));
        
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
          console.log(`Mercredi complet ajouté à fullDates: ${format(dateOption.date, "dd/MM/yyyy")} (places restantes: ${spotsRemaining})`);
        } else {
          availableDates.push(dateOption);
          console.log(`Mercredi disponible: ${format(dateOption.date, "dd/MM/yyyy")} (places restantes: ${spotsRemaining})`);
        }
      }

      console.log("Dates complètes détectées:", fullDates.map(d => format(d, "dd/MM/yyyy")));
      console.log("Dates disponibles:", availableDates.map(d => format(d.date, "dd/MM/yyyy")));

      setExcludedFullDates(fullDates);

      if (availableDates.length === 0) {
        const fullDatesText = fullDates
          .map(date => date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          }))
          .join(', ');

        console.log("Toutes les dates sont complètes, affichage du message d'erreur");

        toast({
          title: "Aucune réservation possible",
          description: `Tous les mercredis sélectionnés sont complets : ${fullDatesText}. Vous pouvez contacter l'accueil pour être mis en liste d'attente.`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        setProgress(0);
        setProgressMessage("");
        return;
      }

      // Étape 3: Créer les réservations
      setProgress(60);
      setProgressMessage("Création des réservations...");
      
      console.log("Début des réservations pour", availableDates.length, "dates disponibles");
      
      for (let i = 0; i < availableDates.length; i++) {
        const dateOption = availableDates[i];
        const progressStep = 60 + (i / availableDates.length) * 20;
        setProgress(progressStep);
        setProgressMessage(`Création de la réservation ${i + 1}/${availableDates.length}...`);

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

      // Étape 4: Envoyer l'email de confirmation
      setProgress(80);
      setProgressMessage("Envoi de l'email de confirmation...");
      
      const childFullName = `${childData.first_name} ${childData.last_name}`;
      const formattedDates = availableDates.map(d => format(d.date, "EEEE d MMMM yyyy", { locale: fr }));
      
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

      // Étape 5: Actualiser les données
      setProgress(90);
      setProgressMessage("Actualisation des données...");
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["available_wednesdays"] }),
        queryClient.invalidateQueries({ queryKey: ["wednesday_reservations"] }),
        refetchReservations()
      ]);

      setProgress(100);
      setProgressMessage("Réservation terminée avec succès !");

      console.log("Avant réinitialisation du formulaire - excludedFullDates:", fullDates.map(d => format(d, "dd/MM/yyyy")));
      
      resetForm();
      
      // Afficher le dialogue de succès après un petit délai
      setTimeout(() => {
        setShowSuccessDialog(true);
        setProgress(0);
        setProgressMessage("");
      }, 500);

    } catch (error: any) {
      console.error("Erreur lors de la création des réservations:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création des réservations.",
        variant: "destructive",
      });
      setProgress(0);
      setProgressMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    handleSubmit, 
    showSuccessDialog, 
    setShowSuccessDialog,
    isSubmitting,
    excludedFullDates,
    progress,
    progressMessage
  };
};
