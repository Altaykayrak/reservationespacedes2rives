
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { HolidayPeriodProvider } from "./holiday/HolidayPeriodContext";
import { useHolidayClassification } from "./holiday/hooks/useHolidayClassification";
import { TeenClassDateSelector } from "./holiday/TeenClassDateSelector";
import { WorkdayDateSelector } from "./holiday/WorkdayDateSelector";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface HolidayDateSelectorProps {
  selectedDates: DateOption[];
  handleDateToggle: (date: Date) => void;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  isDateAlreadyReserved: (date: Date) => boolean;
  periodId: string;
  selectedChild: string;
  setSelectedDates: (dates: DateOption[]) => void;
}

export const HolidayDateSelector = ({
  selectedDates,
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved,
  periodId,
  selectedChild,
  setSelectedDates
}: HolidayDateSelectorProps) => {
  // Récupérer les informations de la période sélectionnée
  const { data: holidayPeriod, isLoading: isLoadingPeriod } = useQuery({
    queryKey: ["holiday_period", periodId],
    queryFn: async () => {
      console.log("Récupération de la période:", periodId);
      
      if (!periodId) {
        console.log("Aucun ID de période fourni");
        return null;
      }
      
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*")
        .eq("id", periodId)
        .single();
      
      if (error) {
        console.error("Erreur lors de la récupération de la période:", error);
        throw error;
      }
      
      console.log("Période récupérée:", data);
      return data;
    },
    enabled: Boolean(periodId)
  });

  const { childInfo, isTeenClass } = useHolidayClassification(selectedChild);

  // Effet pour réinitialiser les dates lors du changement d'enfant
  useEffect(() => {
    console.log("Enfant sélectionné:", selectedChild);
    console.log("Classe ado:", isTeenClass);
    console.log("Période:", holidayPeriod);
    
    if (!selectedChild) return;

    if (isTeenClass && holidayPeriod) {
      // On applique seulement la présélection de "Sans repas" par défaut pour les adolescents
      const isTeenPage = window.location.pathname === "/teenholiday-reservations" || 
                        window.location.pathname === "/admin/reservations/new-teen-holiday" ||
                        window.location.pathname === "/admin/new-teenholiday-reservation";
      if (isTeenPage) {
        // On ne présélectionne plus automatiquement tous les jours de la semaine
        setSelectedDates([]);
      }
    } else {
      // Si ce n'est pas un adolescent, on réinitialise les dates
      setSelectedDates([]);
    }
  }, [selectedChild, isTeenClass, holidayPeriod, setSelectedDates]);

  // Effet pour réinitialiser les dates lors du changement de période
  useEffect(() => {
    console.log("Changement de période, réinitialisation des dates");
    setSelectedDates([]);
  }, [periodId, setSelectedDates]);

  if (isLoadingPeriod) {
    console.log("Chargement de la période en cours...");
    return <div className="p-4 text-center">Chargement de la période...</div>;
  }

  if (!holidayPeriod || !selectedChild) {
    console.log("Période ou enfant manquant:", { period: !!holidayPeriod, child: !!selectedChild });
    return <div className="p-4 text-center">Veuillez sélectionner une période et un enfant.</div>;
  }

  if (!childInfo) {
    console.log("Informations de l'enfant manquantes");
    return <div className="p-4 text-center">Chargement des informations de l'enfant...</div>;
  }

  console.log("HolidayDateSelector rendu avec période et enfant valides");

  return (
    <HolidayPeriodProvider 
      holidayPeriod={holidayPeriod} 
      childInfo={childInfo} 
      isTeenClass={!!isTeenClass}
    >
      {(window.location.pathname === "/teenholiday-reservations" || 
        window.location.pathname === "/admin/reservations/new-teen-holiday" ||
        window.location.pathname === "/admin/new-teenholiday-reservation") && isTeenClass ? (
        <TeenClassDateSelector
          selectedDates={selectedDates}
          isDateAlreadyReserved={isDateAlreadyReserved}
          handleOptionChange={handleOptionChange}
          handleDateToggle={handleDateToggle}
          periodId={periodId}
        />
      ) : (
        <WorkdayDateSelector
          selectedDates={selectedDates}
          handleDateToggle={handleDateToggle}
          handleOptionChange={handleOptionChange}
          isDateAlreadyReserved={isDateAlreadyReserved}
          periodId={periodId}
        />
      )}
    </HolidayPeriodProvider>
  );
};
