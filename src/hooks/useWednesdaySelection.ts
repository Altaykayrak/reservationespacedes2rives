
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAvailableWednesdays } from "./useAvailableWednesdays";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useWednesdaySelection = (selectedChild: string, isDateAlreadyReserved: (date: Date) => boolean) => {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);

  const { data: availableWednesdays = [] } = useAvailableWednesdays(false, false);

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

  // Fonction pour vérifier si un mercredi est complet pour l'enfant sélectionné
  const checkIfWednesdayIsFull = async (wednesdayId: string, childSchoolClass: string) => {
    const isKindergarten = ["PS", "MS", "GS"].includes(childSchoolClass);
    const isPrimary = ["CP", "CE1", "CE2", "CM1", "CM2"].includes(childSchoolClass);

    if (!isKindergarten && !isPrimary) return false;

    const { data: spotsRemaining, error } = await supabase
      .rpc('check_wednesday_spots_remaining', {
        wednesday_id: wednesdayId,
        child_school_class: isKindergarten ? 'MS' : 'CP'
      });

    if (error) {
      console.error('Erreur lors de la vérification des places:', error);
      return false;
    }

    return spotsRemaining <= 0;
  };

  const selectAllDatesBase = async (setMealOption: boolean | null = null, setEarlyDropoffOption: boolean | null = null) => {
    if (!selectedChild || availableWednesdays.length === 0) return;
    
    console.log("Tentative de sélectionner tous les mercredis disponibles");

    // Récupérer les informations de l'enfant sélectionné
    const { data: childData, error: childError } = await supabase
      .from("children")
      .select("school_class")
      .eq("id", selectedChild)
      .single();

    if (childError) {
      console.error("Erreur lors de la récupération des données de l'enfant:", childError);
      return;
    }

    // Récupérer les dates déjà sélectionnées pour conserver leurs options
    const existingOptions = new Map(
      selectedDates.map(d => [d.date.getTime(), { withoutMeal: d.withoutMeal, earlyDropoff: d.earlyDropoff }])
    );

    const availableDates = [];
    const fullDates = [];

    // Vérifier chaque mercredi disponible
    for (const wednesday of availableWednesdays) {
      const date = new Date(wednesday.date);
      const isReserved = isDateAlreadyReserved(date);
      
      if (isReserved) continue;

      const isFull = await checkIfWednesdayIsFull(wednesday.id, childData.school_class);
      
      if (isFull) {
        fullDates.push(date);
      } else {
        availableDates.push({
          date,
          withoutMeal: setMealOption !== null ? setMealOption : (existingOptions.get(date.getTime())?.withoutMeal || false),
          earlyDropoff: setEarlyDropoffOption !== null ? setEarlyDropoffOption : (existingOptions.get(date.getTime())?.earlyDropoff || false)
        });
      }
    }

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

  const selectAllDates = () => selectAllDatesBase();
  const selectAllDatesWithoutMeal = () => selectAllDatesBase(true);
  const selectAllDatesWithEarlyDropoff = () => selectAllDatesBase(null, true);

  return {
    selectedDates,
    setSelectedDates,
    handleDateToggle,
    handleOptionChange,
    selectAllDates,
    selectAllDatesWithoutMeal,
    selectAllDatesWithEarlyDropoff
  };
};
