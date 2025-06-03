
import { useState } from "react";
import { useQueryClient, useIsMutating } from "@tanstack/react-query";
import { useWednesdayReservationSubmission } from "./useWednesdayReservationSubmission";
import { useChildrenData } from "./useChildrenData";
import { useAvailableWednesdays } from "./useAvailableWednesdays";
import { useExistingReservations } from "./useExistingReservations";
import { useToast } from "@/hooks/use-toast";

export const useReservations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
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

  // Fonction pour sélectionner tous les mercredis disponibles
  const selectAllDates = () => {
    if (!selectedChild || availableWednesdays.length === 0) return;
    
    console.log("Tentative de sélectionner tous les mercredis disponibles");
    console.log("Mercredis disponibles bruts:", availableWednesdays);

    // Récupérer les dates déjà sélectionnées pour conserver leurs options
    const existingOptions = new Map(
      selectedDates.map(d => [d.date.getTime(), { withoutMeal: d.withoutMeal, earlyDropoff: d.earlyDropoff }])
    );

    // Filtrer les mercredis : exclure ceux déjà réservés ET ceux qui sont complets
    const availableDates = availableWednesdays
      .filter(wednesday => {
        const date = new Date(wednesday.date);
        const isReserved = isDateAlreadyReserved(date);
        const isFull = wednesday.isFull;
        
        console.log(`Mercredi ${wednesday.date}: réservé=${isReserved}, complet=${isFull}`);
        
        return !isReserved && !isFull;
      })
      .map(wednesday => ({
        date: new Date(wednesday.date),
        withoutMeal: existingOptions.get(new Date(wednesday.date).getTime())?.withoutMeal || false,
        earlyDropoff: existingOptions.get(new Date(wednesday.date).getTime())?.earlyDropoff || false
      }));

    // Identifier les mercredis complets pour le message
    const fullDates = availableWednesdays
      .filter(wednesday => {
        const date = new Date(wednesday.date);
        return !isDateAlreadyReserved(date) && wednesday.isFull;
      })
      .map(wednesday => new Date(wednesday.date));

    console.log("Dates disponibles (non complètes et non réservées):", availableDates);
    console.log("Dates complètes (exclues):", fullDates);

    setSelectedDates(availableDates);

    // Afficher un message si certains mercredis sont complets
    if (fullDates.length > 0) {
      const fullDatesText = fullDates
        .map(date => date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        }))
        .join(', ');

      toast({
        title: "Mercredis complets",
        description: `Les mercredis suivants sont complets et n'ont pas été sélectionnés : ${fullDatesText}. Vous pouvez contacter l'accueil pour être mis en liste d'attente.`,
        variant: "default",
      });
    }
  };

  // Fonction pour sélectionner tous les mercredis disponibles sans repas
  const selectAllDatesWithoutMeal = () => {
    if (!selectedChild || availableWednesdays.length === 0) return;
    
    console.log("Tentative de sélectionner tous les mercredis disponibles sans repas");

    // Récupérer les dates déjà sélectionnées pour conserver leurs options
    const existingOptions = new Map(
      selectedDates.map(d => [d.date.getTime(), { withoutMeal: d.withoutMeal, earlyDropoff: d.earlyDropoff }])
    );

    // Filtrer les mercredis : exclure ceux déjà réservés ET ceux qui sont complets
    const availableDates = availableWednesdays
      .filter(wednesday => {
        const date = new Date(wednesday.date);
        const isReserved = isDateAlreadyReserved(date);
        const isFull = wednesday.isFull;
        return !isReserved && !isFull;
      })
      .map(wednesday => ({
        date: new Date(wednesday.date),
        withoutMeal: true, // Toujours mettre à true
        earlyDropoff: existingOptions.get(new Date(wednesday.date).getTime())?.earlyDropoff || false
      }));

    // Identifier les mercredis complets pour le message
    const fullDates = availableWednesdays
      .filter(wednesday => {
        const date = new Date(wednesday.date);
        return !isDateAlreadyReserved(date) && wednesday.isFull;
      })
      .map(wednesday => new Date(wednesday.date));

    console.log("Dates disponibles sélectionnées sans repas:", availableDates);
    setSelectedDates(availableDates);

    // Afficher un message si certains mercredis sont complets
    if (fullDates.length > 0) {
      const fullDatesText = fullDates
        .map(date => date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        }))
        .join(', ');

      toast({
        title: "Mercredis complets",
        description: `Les mercredis suivants sont complets et n'ont pas été sélectionnés : ${fullDatesText}. Vous pouvez contacter l'accueil pour être mis en liste d'attente.`,
        variant: "default",
      });
    }
  };

  // Fonction pour sélectionner tous les mercredis disponibles avec accueil avant 8h30
  const selectAllDatesWithEarlyDropoff = () => {
    if (!selectedChild || availableWednesdays.length === 0) return;
    
    console.log("Tentative de sélectionner tous les mercredis disponibles avec accueil avant 8h30");

    // Récupérer les dates déjà sélectionnées pour conserver leurs options
    const existingOptions = new Map(
      selectedDates.map(d => [d.date.getTime(), { withoutMeal: d.withoutMeal, earlyDropoff: d.earlyDropoff }])
    );

    // Filtrer les mercredis : exclure ceux déjà réservés ET ceux qui sont complets
    const availableDates = availableWednesdays
      .filter(wednesday => {
        const date = new Date(wednesday.date);
        const isReserved = isDateAlreadyReserved(date);
        const isFull = wednesday.isFull;
        return !isReserved && !isFull;
      })
      .map(wednesday => ({
        date: new Date(wednesday.date),
        withoutMeal: existingOptions.get(new Date(wednesday.date).getTime())?.withoutMeal || false,
        earlyDropoff: true // Toujours mettre à true
      }));

    // Identifier les mercredis complets pour le message
    const fullDates = availableWednesdays
      .filter(wednesday => {
        const date = new Date(wednesday.date);
        return !isDateAlreadyReserved(date) && wednesday.isFull;
      })
      .map(wednesday => new Date(wednesday.date));

    console.log("Dates disponibles sélectionnées avec accueil avant 8h30:", availableDates);
    setSelectedDates(availableDates);

    // Afficher un message si certains mercredis sont complets
    if (fullDates.length > 0) {
      const fullDatesText = fullDates
        .map(date => date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        }))
        .join(', ');

      toast({
        title: "Mercredis complets",
        description: `Les mercredis suivants sont complets et n'ont pas été sélectionnés : ${fullDatesText}. Vous pouvez contacter l'accueil pour être mis en liste d'attente.`,
        variant: "default",
      });
    }
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
