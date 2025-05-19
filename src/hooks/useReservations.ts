
import { useState } from "react";
import { useQueryClient, useIsMutating } from "@tanstack/react-query";
import { useWednesdayReservationSubmission } from "./useWednesdayReservationSubmission";
import { useChildrenData } from "./useChildrenData";
import { useAvailableWednesdays } from "./useAvailableWednesdays";
import { useExistingReservations } from "./useExistingReservations";

export const useReservations = () => {
  const queryClient = useQueryClient();
  const isQueryMutating = useIsMutating() > 0;
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
    setSelectedDates(prev => {
      const existing = prev.find(d => d.date.getTime() === date.getTime());
      if (existing) {
        return prev.filter(d => d.date.getTime() !== date.getTime());
      }
      return [...prev, { date, withoutMeal: false, earlyDropoff: false }];
    });
  };

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    setSelectedDates(prev => prev.map(d => {
      if (d.date.getTime() === date.getTime()) {
        return { ...d, [option]: value };
      }
      return d;
    }));
  };

  // Fonction pour obtenir les dates disponibles
  const getAvailableDates = () => {
    if (!selectedChild || availableWednesdays.length === 0) return [];
    
    return availableWednesdays
      .filter(wednesday => {
        const date = new Date(wednesday.date);
        return !isDateAlreadyReserved(date) && !wednesday.isFull;
      })
      .map(wednesday => ({
        date: new Date(wednesday.date)
      }));
  };

  // Fonction pour sélectionner tous les mercredis disponibles
  const selectAllDates = () => {
    if (!selectedChild || availableWednesdays.length === 0) return;
    
    console.log("Tentative de sélectionner tous les mercredis disponibles");

    // Récupérer les dates déjà sélectionnées pour conserver leurs options
    const existingOptions = new Map(
      selectedDates.map(d => [d.date.getTime(), { withoutMeal: d.withoutMeal, earlyDropoff: d.earlyDropoff }])
    );

    const allAvailableDates = getAvailableDates().map(({ date }) => {
      const existing = existingOptions.get(date.getTime());
      return {
        date,
        withoutMeal: existing?.withoutMeal || false,
        earlyDropoff: existing?.earlyDropoff || false
      };
    });

    console.log("Dates disponibles sélectionnées:", allAvailableDates);
    setSelectedDates(allAvailableDates);
  };

  // Fonction pour sélectionner tous les mercredis disponibles sans repas
  const selectAllDatesWithoutMeal = () => {
    if (!selectedChild || availableWednesdays.length === 0) return;
    
    console.log("Tentative de sélectionner tous les mercredis disponibles sans repas");

    // Récupérer d'abord toutes les dates disponibles
    const availableDates = getAvailableDates();
    
    // Récupérer les dates déjà sélectionnées pour conserver leurs options
    const existingOptions = new Map(
      selectedDates.map(d => [d.date.getTime(), { withoutMeal: d.withoutMeal, earlyDropoff: d.earlyDropoff }])
    );

    // Définir tous les mercredis disponibles comme "sans repas" tout en conservant l'option "accueil avant 8h30"
    const allAvailableDates = availableDates.map(({ date }) => {
      const existing = existingOptions.get(date.getTime());
      return {
        date,
        withoutMeal: true, // Toujours mettre à true
        earlyDropoff: existing?.earlyDropoff || false // Conserver l'option existante
      };
    });

    console.log("Dates disponibles sélectionnées sans repas:", allAvailableDates);
    setSelectedDates(allAvailableDates);
  };

  // Fonction pour sélectionner tous les mercredis disponibles avec accueil avant 8h30
  const selectAllDatesWithEarlyDropoff = () => {
    if (!selectedChild || availableWednesdays.length === 0) return;
    
    console.log("Tentative de sélectionner tous les mercredis disponibles avec accueil avant 8h30");

    // Récupérer d'abord toutes les dates disponibles
    const availableDates = getAvailableDates();
    
    // Récupérer les dates déjà sélectionnées pour conserver leurs options
    const existingOptions = new Map(
      selectedDates.map(d => [d.date.getTime(), { withoutMeal: d.withoutMeal, earlyDropoff: d.earlyDropoff }])
    );

    // Définir tous les mercredis disponibles avec "accueil avant 8h30" tout en conservant l'option "sans repas"
    const allAvailableDates = availableDates.map(({ date }) => {
      const existing = existingOptions.get(date.getTime());
      return {
        date,
        withoutMeal: existing?.withoutMeal || false, // Conserver l'option existante
        earlyDropoff: true // Toujours mettre à true
      };
    });

    console.log("Dates disponibles sélectionnées avec accueil avant 8h30:", allAvailableDates);
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

  const { handleSubmit, showSuccessDialog, setShowSuccessDialog, isSubmitting } = useWednesdayReservationSubmission(
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
    selectAllDatesWithoutMeal,
    selectAllDatesWithEarlyDropoff
  };
};
