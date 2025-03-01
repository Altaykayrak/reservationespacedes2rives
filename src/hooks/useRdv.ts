
import { useRdvState } from "./rdv/useRdvState";
import { useRdvFetch } from "./rdv/useRdvFetch";
import { useRdvFilters } from "./rdv/useRdvFilters";
import { useRdvActions } from "./rdv/useRdvActions";
import { useRdvConfig } from "./rdv/useRdvConfig";
import { useRdvAuth } from "./rdv/useRdvAuth";
import { useEffect } from "react";

export const useRdv = () => {
  // Get authentication state
  const { user, loading: authLoading } = useRdvAuth();
  
  // Get RDV state
  const { 
    rdvList, 
    setRdvList, 
    userRdv, 
    setUserRdv, 
    availableSlots, 
    setAvailableSlots, 
    isLoading, 
    setIsLoading, 
    selectedRdv, 
    setSelectedRdv, 
    selectedMotifs, 
    setSelectedMotifs, 
    showConfirmDialog, 
    setShowConfirmDialog, 
    reservationComplete, 
    setReservationComplete, 
    selectedDate, 
    setSelectedDate 
  } = useRdvState();
  
  // Get RDV fetch functions
  const { fetchUserRdv, fetchRdvs } = useRdvFetch(
    user?.id, 
    setUserRdv, 
    setRdvList, 
    setIsLoading
  );
  
  // Filter slots by date
  useRdvFilters(
    selectedDate, 
    rdvList, 
    setAvailableSlots
  );
  
  // Get RDV actions
  const { 
    handleMotifChange, 
    handleReservation, 
    handleSelectSlot, 
    handleCompleteDialogClose,
    isProcessing 
  } = useRdvActions(
    user, 
    setSelectedMotifs, 
    setSelectedRdv, 
    setShowConfirmDialog, 
    setReservationComplete, 
    setUserRdv, 
    setIsLoading,
    fetchUserRdv
  );
  
  // Get RDV configuration
  const { summerRange } = useRdvConfig();
  
  // Load user RDV when user is available
  useEffect(() => {
    if (user) {
      fetchUserRdv();
    }
  }, [user]);
  
  // Always fetch RDVs when component mounts
  useEffect(() => {
    if (user) {
      fetchRdvs();
    }
  }, [user]);

  // Create a wrapper for handleReservation to pass the current state
  const handleReservationWrapper = async () => {
    await handleReservation(selectedRdv, selectedMotifs);
  };

  return {
    user,
    loading: authLoading || isLoading || isProcessing,
    userRdv,
    rdvList,
    selectedDate,
    setSelectedDate,
    availableSlots,
    selectedRdv,
    selectedMotifs,
    showConfirmDialog,
    setShowConfirmDialog,
    reservationComplete,
    setReservationComplete,
    summerRange,
    handleMotifChange,
    handleReservation: handleReservationWrapper,
    handleSelectSlot,
    handleCompleteDialogClose
  };
};
