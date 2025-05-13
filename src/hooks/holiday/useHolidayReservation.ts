
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDateSelection } from "./useDateSelection";
import { useSelectionState } from "./useSelectionState";
import { useReservationValidation } from "./useReservationValidation";
import { useWeeklyDates } from "./useWeeklyDates";
import { useSubmitReservation } from "./useSubmitReservation";

export const useHolidayReservation = () => {
  // Import sub-hooks
  const { 
    selectedDates, 
    setSelectedDates, 
    handleDateToggle, 
    handleOptionChange 
  } = useDateSelection();

  const {
    selectedChild,
    selectedPeriod,
    setSelectedChild,
    setSelectedPeriod,
    showSuccessDialog,
    setShowSuccessDialog,
    isSubmitting,
    setIsSubmitting,
    noSpotsDialog,
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog
  } = useSelectionState();

  const { isDateAlreadyReserved } = useReservationValidation(selectedChild);
  const { getDatesPerWeek } = useWeeklyDates();

  // Fetch children data
  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch holiday periods data
  const { data: holidayPeriods } = useQuery({
    queryKey: ["available_holiday_periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Use the submit hook
  const { handleSubmit } = useSubmitReservation(
    selectedChild,
    selectedDates,
    selectedPeriod,
    holidayPeriods,
    setSelectedDates,
    setShowSuccessDialog,
    setNoSpotsDialog,
    setMinimumDaysDialog,
    setIsSubmitting
  );

  // Combine all hooks into a single interface
  return {
    // Date selection
    selectedDates,
    handleDateToggle,
    handleOptionChange,
    setSelectedDates,

    // Selection state
    selectedChild,
    selectedPeriod,
    setSelectedChild,
    setSelectedPeriod,
    showSuccessDialog,
    setShowSuccessDialog,
    isSubmitting,
    noSpotsDialog,
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog,

    // Data
    children,
    holidayPeriods,
    
    // Utility functions
    isDateAlreadyReserved,
    getDatesPerWeek,
    
    // Submission
    handleSubmit
  };
};
