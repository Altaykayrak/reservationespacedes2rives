
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDateSelection } from "./holiday/useDateSelection";
import { useSelectionState } from "./holiday/useSelectionState";
import { useReservationValidation } from "./holiday/useReservationValidation";
import { useWeeklyDates } from "./holiday/useWeeklyDates";
import { useSubmitReservation } from "./holiday/useSubmitReservation";
import { useCallback } from "react";

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

  // Simple direct hook usage, avoiding circular dependencies
  const { isDateAlreadyReserved } = useReservationValidation(selectedChild);
  
  const { getDatesPerWeek } = useWeeklyDates();

  // Fetch children data
  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      console.log("Fetching children data");
      const { data, error } = await supabase
        .from("children")
        .select("*");
      
      if (error) {
        console.error("Error fetching children:", error);
        throw error;
      }
      
      return data;
    },
  });

  // Fetch holiday periods data
  const { data: holidayPeriods } = useQuery({
    queryKey: ["available_holiday_periods"],
    queryFn: async () => {
      console.log("Fetching holiday periods");
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*");
      
      if (error) {
        console.error("Error fetching holiday periods:", error);
        throw error;
      }
      
      return data;
    },
  });

  // Use the submit hook with proper dependencies
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

  // Optimized setters to avoid unnecessary re-renders
  const safeSetSelectedChild = useCallback((childId: string) => {
    setSelectedChild(childId);
  }, [setSelectedChild]);

  const safeSetSelectedPeriod = useCallback((periodId: string) => {
    setSelectedPeriod(periodId);
  }, [setSelectedPeriod]);

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
    setSelectedChild: safeSetSelectedChild,
    setSelectedPeriod: safeSetSelectedPeriod,
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
