// src/hooks/useHolidayReservation.ts
import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { format, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
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
    isDateAlreadyReserved,
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

      const newDates = isSelected
        ? prev.filter((d) => d.date.toISOString().split("T")[0] !== dateStr)
        : [...prev, { date: new Date(date), withoutMeal: false, earlyDropoff: false }];

      return newDates;
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

    // Minimum 3 jours
    const validDates = selectedDates.filter(
      (d) => d.date instanceof Date && !isNaN(d.date.getTime())
    );
    if (validDates.length < 3) {
      setMinimumDaysDialog({ isOpen: true });
      return;
    }

    setIsSubmitting(true);
    try {
      // Création des réservations sur le back
      const result = await createHolidayReservations(
        selectedChild,
        selectedDates,
        holidayPeriods,
        Date.now()
      );

      if (result.success) {
        // Réinitialisation et rafraîchissement
        setSelectedDates([]);
        await refetchExisting();                // ← rafraîchir les réservations existantes
        queryClient.invalidateQueries({          // ← rafraîchir le compteur period_spots_available
          queryKey: ["period_spots_available", selectedPeriod, result.schoolClass],
        });
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

  // Log pour debug
  useEffect(() => {
    console.log(
      `useHolidayReservation: ${selectedDates.length} dates sélectionnées, child=${selectedChild}, period=${selectedPeriod}`
    );
  }, [selectedDates, selectedChild, selectedPeriod]);

  return {
    children,
    holidayPeriods,
    selectedDates,
    selectedChild,
    selectedPeriod,
    setSelectedChild,
    setSelectedPeriod,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    isDateAlreadyReserved,
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
