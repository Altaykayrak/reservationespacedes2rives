
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
  const { data: holidayPeriod } = useQuery({
    queryKey: ["holiday_period", periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*")
        .eq("id", periodId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!periodId
  });

  const { childInfo, isTeenClass } = useHolidayClassification(selectedChild);

  // Effet pour réinitialiser les dates lors du changement d'enfant
  useEffect(() => {
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
    setSelectedDates([]);
  }, [periodId, setSelectedDates]);

  if (!holidayPeriod || !selectedChild) return null;

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
