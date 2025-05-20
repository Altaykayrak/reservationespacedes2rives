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
  const [noSpotsDialog, setNoSpotsDialog] = useState({ isOpen: false, schoolClass: "", date: new Date() });
  const [minimumDaysDialog, setMinimumDaysDialog] = useState({ isOpen: false });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // → Intégration du hook des réservations existantes
  const {
    existingReservations,
    refetchReservations: refetchHolidayReservations,
    isDateAlreadyReserved
  } = useExistingHolidayReservations(selectedChild || "");

  // On garde l’ancien pour les listes (uniquement si tu en as besoin ailleurs)
  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase.from("children").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: holidayPeriods } = useQuery({
    queryKey: ["available_holiday_periods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("available_holiday_periods").select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleDateToggle = useCallback((date: Date) => {
    setSelectedDates(prev => {
      const dateStr = date.toISOString().split("T")[0];
      const isSelected = prev.some(d => d.date.toISOString().split("T")[0] === dateStr);
      const newDates = isSelected
        ? prev.filter(d => d.date.toISOString().split("T")[0] !== dateStr)
        : [...prev, { date: new Date(date), withoutMeal: window.location.pathname.includes("teenholiday"), earlyDropoff: false }];
      return newDates;
    });
  }, []);

  const handleOptionChange = (date: Date, option: "withoutMeal" | "earlyDropoff", value: boolean) => {
    setSelectedDates(prev =>
      prev.map(d => 
        d.date.toISOString().split("T")[0] === date.toISOString().split("T")[0]
          ? { ...d, [option]: value }
          : d
      )
    );
  };

  const handleSubmit = async () => {
    if (!selectedChild || !selectedPeriod) return;

    const validDates = selectedDates.filter(d => d.date instanceof Date && !isNaN(d.date.getTime()));
    if (validDates.length < 3) {
      setMinimumDaysDialog({ isOpen: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createHolidayReservations(
        selectedChild,
        selectedDates,
        holidayPeriods,
        Date.now()
      );

      if (result.success) {
        setSelectedDates([]);

        // 👉 on rafraîchit les réservations existantes
        await refetchHolidayReservations();

        // 👉 on invalide la query des périodes pour recalculer max_participants_*
        queryClient.invalidateQueries(["available_holiday_periods"]);

        setShowSuccessDialog(true);
      } else if (result.noSpots) {
        setNoSpotsDialog({
          isOpen: true,
          schoolClass: result.noSpots.schoolClass,
          date: result.noSpots.date,
        });
      } else {
        toast({ title: "Erreur", description: result.error || "Erreur inconnue", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug / logs éventuels...
  useEffect(() => {
    console.log("Existing reservations (hook):", existingReservations);
  }, [existingReservations]);

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
    showSuccessDialog,
    setShowSuccessDialog,
    isSubmitting,
    noSpotsDialog,
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog,
    existingReservations,
  };
};
