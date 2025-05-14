
import { useState } from "react";
import { useQueryClient, useIsMutating } from "@tanstack/react-query";
import { useWednesdayReservationSubmission } from "./useWednesdayReservationSubmission";
import { useChildrenData } from "./useChildrenData";
import { useAvailableWednesdays } from "./useAvailableWednesdays";
import { useExistingReservations } from "./useExistingReservations";

export const useReservations = () => {
  const queryClient = useQueryClient();
  const isSubmitting = useIsMutating() > 0;
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedDates, setSelectedDates] = useState<Array<{
    date: Date;
    withoutMeal: boolean;
    earlyDropoff: boolean;
  }>>([]);

  // Utiliser useChildrenData pour récupérer les enfants
  const { children, wednesdayEligibleChildren } = useChildrenData();

  // Récupérer les mercredis disponibles pour la fonction selectAllDates
  const { data: availableWednesdays = [] } = useAvailableWednesdays(false, false);
  
  // Utiliser le nouveau hook pour les réservations existantes
  const { 
    existingReservations: wednesdayReservations, 
    refetchReservations, 
    isDateAlreadyReserved 
  } = useExistingReservations(selectedChild);

  const handleDateToggle = (date: Date) => {
    console.log("handleDateToggle called with date:", date);
    setSelectedDates(prev => {
      // Vérifier si la date est déjà sélectionnée
      const existingIndex = prev.findIndex(d => {
        if (!(d.date instanceof Date)) return false;
        return d.date.getTime() === date.getTime();
      });
      
      console.log("existingIndex:", existingIndex);
      
      // Si la date est déjà sélectionnée, la supprimer
      if (existingIndex !== -1) {
        const newDates = [...prev];
        newDates.splice(existingIndex, 1);
        console.log("Date removed, new dates:", newDates);
        return newDates;
      }
      
      // Sinon l'ajouter
      const newDates = [...prev, { date, withoutMeal: false, earlyDropoff: false }];
      console.log("Date added, new dates:", newDates);
      return newDates;
    });
  };

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    console.log("handleOptionChange called with:", { date, option, value });
    setSelectedDates(prev => prev.map(d => {
      if (!(d.date instanceof Date)) return d;
      if (d.date.getTime() === date.getTime()) {
        return { ...d, [option]: value };
      }
      return d;
    }));
  };

  // Fonction pour sélectionner tous les mercredis disponibles
  const selectAllDates = () => {
    if (!selectedChild || availableWednesdays.length === 0) return;
    
    console.log("Tentative de sélectionner tous les mercredis disponibles");

    const allAvailableDates = availableWednesdays
      .filter(wednesday => {
        // Ne pas inclure les dates déjà réservées
        const date = new Date(wednesday.date);
        return !isDateAlreadyReserved(date) && !wednesday.isFull;
      })
      .map(wednesday => {
        const date = new Date(wednesday.date);
        return {
          date,
          withoutMeal: false,
          earlyDropoff: false
        };
      });

    console.log("Dates disponibles sélectionnées:", allAvailableDates);
    setSelectedDates(allAvailableDates);
  };

  // Nouvelle fonction pour sélectionner tous les mercredis disponibles sans repas
  const selectAllDatesWithoutMeal = () => {
    if (!selectedChild || availableWednesdays.length === 0) return;
    
    console.log("Tentative de sélectionner tous les mercredis disponibles sans repas");

    const allAvailableDates = availableWednesdays
      .filter(wednesday => {
        // Ne pas inclure les dates déjà réservées
        const date = new Date(wednesday.date);
        return !isDateAlreadyReserved(date) && !wednesday.isFull;
      })
      .map(wednesday => {
        const date = new Date(wednesday.date);
        return {
          date,
          withoutMeal: true,
          earlyDropoff: false
        };
      });

    console.log("Dates disponibles sélectionnées sans repas:", allAvailableDates);
    setSelectedDates(allAvailableDates);
  };

  const isDateReservedForChild = (childId: string, date: Date) => {
    if (childId !== selectedChild) return false;
    return isDateAlreadyReserved(date);
  };

  const resetForm = () => {
    setSelectedChild("");
    setSelectedDates([]);
  };

  const { handleSubmit, showSuccessDialog, setShowSuccessDialog } = useWednesdayReservationSubmission(
    selectedChild,
    selectedDates,
    (date) => isDateReservedForChild(selectedChild, date),
    refetchReservations,
    resetForm
  );

  return {
    selectedDates,
    setSelectedDates, 
    selectedChild,
    setSelectedChild,
    children,
    wednesdayReservations,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    isDateReservedForChild,
    resetForm,
    refetchReservations,
    isSubmitting,
    showSuccessDialog,
    setShowSuccessDialog,
    selectAllDates,
    selectAllDatesWithoutMeal
  };
};
