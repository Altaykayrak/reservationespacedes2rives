
import { useState } from "react";
import { useChildrenData } from "@/hooks/useChildrenData";
import { useHolidayPeriods } from "@/hooks/useHolidayPeriods";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { nanoid } from "nanoid";
import { addDays, format, parseISO, getDay } from "date-fns";
import { toast } from "sonner";
import { useExistingHolidayReservations } from "./useExistingHolidayReservations";
import { getWeeksFromDates } from "@/utils/dateUtils";

export const useHolidayReservation = () => {
  const [selectedDates, setSelectedDates] = useState<{
    date: Date;
    withoutMeal: boolean;
    earlyDropoff: boolean;
  }[]>([]);
  
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
  const { existingReservations, refetchReservations, isDateAlreadyReserved } = 
    useExistingHolidayReservations(selectedChild);
  
  // État pour suivre si le formulaire est en cours d'envoi
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupérer les informations sur l'enfant sélectionné
  const { data: childInfo } = useQuery({
    queryKey: ["children", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return null;
      
      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("id", selectedChild)
        .single();
      
      return data;
    },
    enabled: !!selectedChild
  });
  
  // Toggle date selection
  const handleDateToggle = (date: Date) => {
    console.log(`Toggle date: ${format(date, "yyyy-MM-dd")}`);

    const isTeenHolidayReservation = location.pathname === "/teenholiday-reservations" ||
      location.pathname === "/admin/reservations/new-teen-holiday";

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
          withoutMeal: isTeenHolidayReservation, // "Sans repas" activé par défaut pour les ados
          earlyDropoff: false // "Accueil avant 8h30" désactivé par défaut
        }
      ]);
    }
  };

  // Handle option changes
  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    setSelectedDates(
      selectedDates.map(d => 
        format(d.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
          ? { ...d, [option]: value }
          : d
      )
    );
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
      const { error } = await supabase
        .from("holiday_reservations")
        .insert(reservations);
      
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
  
  // Vérifier les spots disponibles avant soumission
  const checkAvailableSpots = async () => {
    if (!selectedChild || !childInfo) return false;
    
    try {
      for (const dateObj of selectedDates) {
        const formattedDate = format(dateObj.date, "yyyy-MM-dd");
        
        // 1. Vérifier si cette date est déjà réservée
        if (isDateAlreadyReserved(dateObj.date)) {
          console.log(`Date ${formattedDate} déjà réservée, ignorée`);
          continue; // On ignore cette date
        }
        
        // 2. Obtenir les informations sur la période
        const { data: periodData } = await supabase
          .from("available_holiday_periods")
          .select("*")
          .eq("id", selectedPeriod)
          .single();
        
        if (!periodData) {
          console.error("Période introuvable");
          return false;
        }
        
        // 3. Déterminer la catégorie de l'enfant
        const schoolClass = childInfo.school_class;
        
        let group = "";
        
        // Traitement spécial pour CM2 durant l'été
        if (schoolClass === "CM2" && 
            periodData.name && 
            ["ETE-01", "ETE-02", "ETE-03", "ETE-04"].includes(periodData.name)) {
          group = "teen";
        } else {
          // Vérifier s'il y a un mapping spécifique
          const { data: mappings } = await supabase
            .from("holiday_period_class_mappings")
            .select("*")
            .eq("holiday_period_id", selectedPeriod)
            .eq("school_class", schoolClass);
          
          let category = "";
          if (mappings && mappings.length > 0) {
            category = mappings[0].category;
          } else {
            // Catégories par défaut
            if (["PS", "MS", "GS"].includes(schoolClass)) {
              category = "maternelle";
            } else if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(schoolClass)) {
              category = "primaire";
            } else {
              category = "adolescent";
            }
          }
          
          // Convertir la catégorie en groupe
          if (category === "maternelle") group = "kindergarten";
          else if (category === "primaire") group = "primary";
          else if (category === "adolescent") group = "teen";
        }
        
        console.log(`Groupe déterminé pour ${schoolClass} dans ${periodData.name}: ${group}`);
        
        if (!group) {
          console.error(`Impossible de déterminer le groupe pour la classe ${schoolClass}`);
          return false;
        }
        
        // 4. Compter les places déjà réservées
        const { data: reservationsData } = await supabase
          .from("holiday_reservations")
          .select("id, child_id, child:children(school_class)")
          .eq("period_id", selectedPeriod)
          .eq("reservation_date", formattedDate)
          .eq("status", "confirmed");
        
        if (!reservationsData) {
          console.error("Erreur lors de la récupération des réservations");
          return false;
        }
        
        // 5. Compter les réservations pour le même groupe
        let reservationsCount = 0;
        
        for (const res of reservationsData || []) {
          if (!res.child) continue;
          
          const resChildClass = res.child.school_class;
          let resGroup = "";
          
          // Déterminer le groupe de cet enfant
          if (resChildClass === "CM2" && 
              periodData.name && 
              ["ETE-01", "ETE-02", "ETE-03", "ETE-04"].includes(periodData.name)) {
            resGroup = "teen";
          } else {
            // Vérifier s'il y a un mapping spécifique
            const { data: resMappings } = await supabase
              .from("holiday_period_class_mappings")
              .select("*")
              .eq("holiday_period_id", selectedPeriod)
              .eq("school_class", resChildClass);
            
            let resCategory = "";
            if (resMappings && resMappings.length > 0) {
              resCategory = resMappings[0].category;
            } else {
              // Catégories par défaut
              if (["PS", "MS", "GS"].includes(resChildClass)) {
                resCategory = "maternelle";
              } else if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(resChildClass)) {
                resCategory = "primaire";
              } else {
                resCategory = "adolescent";
              }
            }
            
            // Convertir la catégorie en groupe
            if (resCategory === "maternelle") resGroup = "kindergarten";
            else if (resCategory === "primaire") resGroup = "primary";
            else if (resCategory === "adolescent") resGroup = "teen";
          }
          
          // Compter seulement si c'est le même groupe
          if (resGroup === group) {
            reservationsCount++;
          }
        }
        
        // 6. Vérifier si des places sont encore disponibles
        const maxSpots = periodData[`max_participants_${group}`] || 0;
        const spotsLeft = maxSpots - reservationsCount;
        
        console.log(`Vérification des places pour ${formattedDate}: max=${maxSpots}, réservées=${reservationsCount}, disponibles=${spotsLeft}`);
        
        if (spotsLeft <= 0) {
          setNoSpotsDialog({
            isOpen: true,
            schoolClass: childInfo.school_class,
            date: dateObj.date
          });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification des places:", error);
      return false;
    }
  };
  
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
