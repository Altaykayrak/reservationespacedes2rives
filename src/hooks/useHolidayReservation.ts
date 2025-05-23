
// src/hooks/useHolidayReservation.ts
import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { createHolidayReservations } from "@/utils/reservationCreationUtils";
import { sendHolidayReservationEmail } from "@/utils/emailUtils";
import { validateMinimumDays } from "@/utils/reservationValidationUtils";
import { useExistingHolidayReservations } from "@/hooks/useExistingHolidayReservations";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useHolidayReservation = () => {
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noSpotsDialog, setNoSpotsDialog] = useState({
    isOpen: false,
    schoolClass: "",
    date: new Date(),
  });
  const [minimumDaysDialog, setMinimumDaysDialog] = useState({ isOpen: false });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Hook pour récupérer et rafraîchir les réservations existantes
  const {
    existingReservations,
    refetchReservations: refetchExisting,
  } = useExistingHolidayReservations(selectedChild || "");

  // Charger la liste des enfants
  const { data: children } = useQuery<Tables<"children">[]>({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase.from("children").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Charger les périodes de vacances
  const { data: holidayPeriods } = useQuery<Tables<"available_holiday_periods">[]>({
    queryKey: ["available_holiday_periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Sélection d'une date
  const handleDateToggle = useCallback((date: Date) => {
    setSelectedDates((prev) => {
      const dateStr = date.toISOString().split("T")[0];
      const isSelected = prev.some(
        (d) => d.date.toISOString().split("T")[0] === dateStr
      );
      return isSelected
        ? prev.filter((d) => d.date.toISOString().split("T")[0] !== dateStr)
        : [...prev, { date: new Date(date), withoutMeal: false, earlyDropoff: false }];
    });
  }, []);

  // Changement d'option (sans repas / accueil matinal)
  const handleOptionChange = (
    date: Date,
    option: "withoutMeal" | "earlyDropoff",
    value: boolean
  ) => {
    setSelectedDates((prev) =>
      prev.map((d) =>
        d.date.toISOString().split("T")[0] === date.toISOString().split("T")[0]
          ? { ...d, [option]: value }
          : d
      )
    );
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    if (!selectedChild || !selectedPeriod) return;

    const validDates = selectedDates.filter(
      (d) => d.date instanceof Date && !isNaN(d.date.getTime())
    );
    
    // Vérification des 3 jours min déplacée vers le composant qui utilise le hook
    // pour permettre de la désactiver avec disableMinimumDaysRule

    setIsSubmitting(true);
    const timestamp = Date.now();

    try {
      const result = await createHolidayReservations(
        selectedChild,
        selectedDates,
        holidayPeriods,
        timestamp
      );

      if (result.success) {
        // Envoi de l'email
        try {
          const childFullName = `${result.childData?.first_name} ${result.childData?.last_name}`;
          await sendHolidayReservationEmail(
            childFullName,
            selectedDates,
            result.periodName || "",
            result.reservationNumber || "",
            result.periodId || "",
            timestamp,
            result.childData?.school_class || ""
          );
        } catch (emailErr) {
          console.error("Erreur envoi email vacances:", emailErr);
        }

        // Vide la sélection et rafraîchit tout :
        setSelectedDates([]);
        await refetchExisting(); // met à jour le badge "déjà réservé"
        
        // Invalider toutes les requêtes liées aux réservations
        queryClient.invalidateQueries({
          queryKey: ["holiday_reservations"],
        }); // requête principale pour la liste des réservations
        
        queryClient.invalidateQueries({
          queryKey: ["period_spots_available", selectedPeriod, result.childData?.school_class],
        }); // rafraîchit le compteur de places
        queryClient.invalidateQueries({
          queryKey: ["holiday_reservations_list", selectedPeriod],
        }); // rafraîchit la liste en bas de page
        
        setShowSuccessDialog(true);

      } else if (result.noSpots) {
        setNoSpotsDialog({
          isOpen: true,
          schoolClass: result.noSpots.schoolClass,
          date: result.noSpots.date,
        });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Problème lors de la réservation",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Erreur inattendue",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    children,
    holidayPeriods,
    selectedDates,
    setSelectedDates,
    selectedChild,
    setSelectedChild,
    selectedPeriod,
    setSelectedPeriod,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    existingReservations,
    showSuccessDialog,
    setShowSuccessDialog,
    noSpotsDialog,
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog,
    isSubmitting,
  };
};
