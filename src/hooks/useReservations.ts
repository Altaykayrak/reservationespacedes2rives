
import { useQueryClient, useIsMutating } from "@tanstack/react-query";
import { useWednesdayReservationSubmission } from "./useWednesdayReservationSubmission";
import { useExistingReservations } from "./useExistingReservations";
import { useChildSelection } from "./useChildSelection";
import { useWednesdaySelection } from "./useWednesdaySelection";

export const useReservations = () => {
  const queryClient = useQueryClient();
  const isQueryMutating = useIsMutating() > 0;

  const { selectedChild, setSelectedChild, children, wednesdayEligibleChildren } = useChildSelection();
  
  // Utiliser le nouveau hook pour les réservations existantes
  const { 
    existingReservations: wednesdayReservations, 
    refetchReservations, 
    isDateAlreadyReserved 
  } = useExistingReservations(selectedChild);

  const {
    selectedDates,
    setSelectedDates,
    handleDateToggle,
    handleOptionChange,
    selectAllDates,
    selectAllDatesWithoutMeal,
    selectAllDatesWithEarlyDropoff
  } = useWednesdaySelection(selectedChild, isDateAlreadyReserved);

  const isDateReservedForChild = (childId: string, date: Date) => {
    if (childId !== selectedChild) return false;
    return isDateAlreadyReserved(date);
  };

  const resetForm = () => {
    setSelectedChild("");
    setSelectedDates([]);
  };

  const { 
    handleSubmit: handleWednesdaySubmit, 
    showSuccessDialog, 
    setShowSuccessDialog, 
    isSubmitting,
    excludedFullDates 
  } = useWednesdayReservationSubmission(
    selectedChild,
    selectedDates,
    (date) => isDateReservedForChild(selectedChild, date),
    async () => {
      await refetchReservations();
      // Invalider la requête de la liste des réservations également
      queryClient.invalidateQueries({ queryKey: ["wednesday_reservations"] });
    },
    resetForm
  );

  console.log("useReservations - handleSubmit va appeler handleWednesdaySubmit");

  return {
    selectedDates,
    setSelectedDates,
    selectedChild,
    setSelectedChild,
    children,
    wednesdayReservations,
    handleDateToggle,
    handleOptionChange,
    handleSubmit: handleWednesdaySubmit, // Utiliser directement la fonction du hook de soumission
    isDateReservedForChild,
    resetForm,
    refetchReservations,
    isSubmitting,
    showSuccessDialog,
    setShowSuccessDialog,
    selectAllDates,
    selectAllDatesWithoutMeal,
    selectAllDatesWithEarlyDropoff,
    excludedFullDates
  };
};
