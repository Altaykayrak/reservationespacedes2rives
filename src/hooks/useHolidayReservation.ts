
import { useState } from "react";
import { useChildrenData } from "@/hooks/useChildrenData";
import { useHolidayPeriods } from "@/hooks/useHolidayPeriods";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { nanoid } from "nanoid";
import { format } from "date-fns";
import { toast } from "sonner";
import { useExistingHolidayReservations } from "./useExistingHolidayReservations";
import { getWeeksFromDates } from "@/utils/dateUtils";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useHolidayReservation = () => {
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [noSpotsDialog, setNoSpotsDialog] = useState({
    isOpen: false,
    schoolClass: "",
    date: null as Date | null
  });
  const [minimumDaysDialog, setMinimumDaysDialog] = useState({
    isOpen: false
  });
  
  const queryClient = useQueryClient();
  
  // Récupérer les données des enfants et des périodes
  const { children } = useChildrenData();
  const { holidayPeriods } = useHolidayPeriods();
  const { existingReservations, refetchReservations, isDateAlreadyReserved } = useExistingHolidayReservations(selectedChild);
  
  // État pour suivre si le formulaire est en cours d'envoi
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toggle date selection
  const handleDateToggle = (date: Date) => {
    console.log(`Toggle date: ${format(date, "yyyy-MM-dd")}`);
    
    const isTeenHolidayReservation = window.location.pathname === "/teenholiday-reservations" || 
                                    window.location.pathname === "/admin/reservations/new-teen-holiday";
    
    const existingDateIndex = selectedDates.findIndex(
      d => format(d.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
    
    if (existingDateIndex >= 0) {
      // Si la date existe déjà, la supprimer
      setSelectedDates(selectedDates.filter((_, i) => i !== existingDateIndex));
    } else {
      // Sinon, l'ajouter avec les options par défaut
      // Pour le "Club Ado", l'option "Sans repas" est activée par défaut
      setSelectedDates([
        ...selectedDates,
        {
          date,
          withoutMeal: isTeenHolidayReservation,
          earlyDropoff: false // "Accueil avant 8h30" désactivé par défaut
        }
      ]);
    }
  };
  
  // Handle option changes
  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    setSelectedDates(selectedDates.map(d => 
      format(d.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") 
        ? { ...d, [option]: value } 
        : d
    ));
  };
  
  // Create reservations mutation
  const createReservations = useMutation({
    mutationFn: async () => {
      if (!selectedChild || !selectedPeriod || selectedDates.length === 0) return;
      
      // Générer un numéro de réservation unique
      const reservationNumber = nanoid(8).toUpperCase();
      
      // Préparer les réservations
      const reservations = selectedDates.map(d => ({
        child_id: selectedChild,
        period_id: selectedPeriod,
        reservation_date: format(d.date, "yyyy-MM-dd"),
        without_meal: d.withoutMeal,
        early_dropoff: d.earlyDropoff,
        reservation_number: reservationNumber,
        status: "confirmed"
      }));
      
      // Insérer les réservations dans la base de données
      const { error } = await supabase.from("holiday_reservations").insert(reservations);
      if (error) throw error;
      
      return { reservationNumber };
    },
    onSuccess: () => {
      // Rafraîchir les données des réservations
      queryClient.invalidateQueries({ queryKey: ["holiday_reservations"] });
      queryClient.invalidateQueries({ queryKey: ["existing_holiday_reservations"] });
      
      // Réinitialiser le formulaire
      setSelectedDates([]);
      setShowSuccessDialog(true);
      refetchReservations();
    }
  });
  
  // Vérifier que le minimum de 3 jours par semaine est respecté
  const checkMinimumDays = () => {
    // Obtenir la liste des dates sélectionnées
    const dates = selectedDates.map(d => d.date);
    
    // Vérifier s'il y a au moins une date sélectionnée
    if (dates.length === 0) {
      return false;
    }
    
    // Obtenir les semaines avec leurs jours
    const weeks = getWeeksFromDates(dates);
    
    // Vérifier chaque semaine pour le minimum de 3 jours
    const isTeenReservation = window.location.pathname === "/teenholiday-reservations" || 
                             window.location.pathname === "/admin/reservations/new-teen-holiday" || 
                             window.location.pathname === "/admin/new-teenholiday-reservation";
    
    // Si c'est une réservation ado, on vérifie toutes les semaines
    if (isTeenReservation) {
      for (const weekDates of weeks) {
        if (weekDates.length < 3) {
          setMinimumDaysDialog({ isOpen: true });
          return false;
        }
      }
    }
    
    // Si on arrive ici, toutes les vérifications sont passées
    return true;
  };
  
  // Vérifier les spots disponibles avant soumission
  const checkAvailableSpots = async () => {
    // Vérification des places disponibles
    // Cette fonction est simplifiée pour cet exemple
    // Dans une implémentation complète, elle vérifierait les places disponibles pour chaque date
    return true;
  };
  
  const handleSubmit = async () => {
    console.log("Début de la soumission");
    
    // Éviter les soumissions multiples
    if (isSubmitting) {
      console.log("Déjà en cours de soumission, ignoré");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Vérifications préalables
      console.log("Vérification des jours minimums");
      const minDaysOk = checkMinimumDays();
      if (!minDaysOk) {
        console.log("Validation échouée: minimum de jours non respecté");
        setIsSubmitting(false);
        return;
      }
      
      console.log("Vérification des places disponibles");
      const spotsOk = await checkAvailableSpots();
      if (!spotsOk) {
        console.log("Validation échouée: places non disponibles");
        setIsSubmitting(false);
        return;
      }
      
      console.log("Toutes les vérifications OK, envoi de la réservation");
      await createReservations.mutateAsync();
      console.log("Réservation créée avec succès");
      
      // Réinitialiser le formulaire
      setSelectedDates([]);
      console.log("Formulaire réinitialisé");
      
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast.error("Une erreur est survenue lors de la réservation. Veuillez réessayer.");
    } finally {
      console.log("Fin de la soumission");
      setIsSubmitting(false);
    }
  };
  
  return {
    selectedDates,
    selectedChild,
    selectedPeriod,
    setSelectedChild,
    setSelectedPeriod,
    children,
    holidayPeriods,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    isDateAlreadyReserved,
    setSelectedDates,
    showSuccessDialog,
    setShowSuccessDialog,
    isSubmitting,
    noSpotsDialog,
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog
  };
};
