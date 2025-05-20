// src/hooks/useHolidayReservation.ts
import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { createHolidayReservations } from "@/utils/reservationCreationUtils";
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

  // Ton hook pour récupérer isDateAlreadyReserved et refetch
  const {
    existingReservations,
    refetchReservations: refetchHolidayReservations,
    isDateAlreadyReserved
  } = useExistingHolidayReservations(selectedChild || "");

  // Children et periods
  const { data: children } = useQuery(["children"], () =>
    supabase.from("children").select("*").then(res => { if (res.error) throw res.error; return res.data; })
  );
  const { data: holidayPeriods } = useQuery(["available_holiday_periods"], () =>
    supabase.from("available_holiday_periods").select("*").then(res => { if (res.error) throw res.error; return res.data; })
  );

  const handleDateToggle = useCallback((date: Date) => {
    setSelectedDates(prev => {
      const key = date.toISOString().split("T")[0];
      const isSel = prev.some(d => d.date.toISOString().split("T")[0] === key);
      return isSel
        ? prev.filter(d => d.date.toISOString().split("T")[0] !== key)
        : [...prev, { date, withoutMeal: window.location.pathname.includes("teenholiday"), earlyDropoff: false }];
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
    const validDates = selectedDates.filter(d => !isNaN(d.date.getTime()));
    if (validDates.length < 3) {
      setMinimumDaysDialog({ isOpen: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createHolidayReservations(selectedChild, selectedDates, holidayPeriods, Date.now());
      if (result.success) {
        setSelectedDates([]);
        await refetchHolidayReservations();
        queryClient.invalidateQueries(["available_holiday_periods"]);
        setShowSuccessDialog(true);
      } else if (result.noSpots) {
        setNoSpotsDialog({ isOpen: true, schoolClass: result.noSpots.schoolClass, date: result.noSpots.date });
      } else {
        toast({ title: "Erreur", description: result.error || "Erreur inconnue", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // **On n’oublie PAS de retourner `setSelectedDates`**
    selectedDates,
    setSelectedDates,        // ← ajouté
    selectedChild,
    setSelectedChild,
    selectedPeriod,
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
