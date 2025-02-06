
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyHolidayState } from "./holiday/EmptyHolidayState";
import { DateItem } from "./holiday/DateItem";
import { useEffect } from "react";

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

  const { data: childInfo } = useQuery({
    queryKey: ["child", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return null;
      const { data, error } = await supabase
        .from("children")
        .select("school_class")
        .eq("id", selectedChild)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedChild
  });

  const { data: schoolClassCategories } = useQuery({
    queryKey: ["schoolClassCategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*")
        .eq("category", "adolescent");
      
      if (error) throw error;
      return data;
    },
  });

  const isTeenClass = childInfo?.school_class && schoolClassCategories?.some(
    category => category.name.toUpperCase() === childInfo.school_class.toUpperCase()
  );

  // Effet pour sélectionner toutes les dates pour les adolescents
  useEffect(() => {
    if (isTeenClass && holidayPeriod) {
      console.log("Sélection des dates pour adolescent");
      const dates: DateOption[] = [];
      const startDate = new Date(holidayPeriod.start_date);
      const endDate = new Date(holidayPeriod.end_date);
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          dates.push({
            date: new Date(currentDate),
            withoutMeal: true,
            earlyDropoff: false
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setSelectedDates(dates);
    }
  }, [isTeenClass, holidayPeriod, setSelectedDates]);

  if (!holidayPeriod) {
    return (
      <EmptyHolidayState 
        message="Sélectionnez une période"
        subtitle="Veuillez d'abord sélectionner une période de vacances."
      />
    );
  }

  if (isTeenClass) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            Les adolescents doivent être inscrits pour la semaine complète. La réservation sera automatiquement faite pour tous les jours de la période.
          </AlertDescription>
        </Alert>
        <ScrollArea className="h-[300px] pr-3">
          <div className="space-y-1">
            {selectedDates.map((dateOption) => (
              <DateItem
                key={dateOption.date.toISOString()}
                date={dateOption.date}
                isSelected={true}
                isReserved={isDateAlreadyReserved(dateOption.date)}
                withoutMeal={true}
                earlyDropoff={dateOption.earlyDropoff}
                onDateToggle={() => {}} // Disabled for teens
                onOptionChange={(option, value) => 
                  option === 'earlyDropoff' ? handleOptionChange(dateOption.date, option, value) : null
                }
                isTeenClass={true}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  const dates: Date[] = [];
  const startDate = new Date(holidayPeriod.start_date);
  const endDate = new Date(holidayPeriod.end_date);
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (dates.length === 0) {
    return (
      <EmptyHolidayState 
        message="Aucune date disponible"
        subtitle="Il n'y a pas de dates disponibles pour cette période."
      />
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-3">
      <div className="space-y-1">
        {dates.map((date) => {
          const selectedDateOption = selectedDates.find(
            (d) => d.date.getTime() === date.getTime()
          );
          const isReserved = isDateAlreadyReserved(date);

          return (
            <DateItem
              key={date.toISOString()}
              date={date}
              isSelected={!!selectedDateOption}
              isReserved={isReserved}
              withoutMeal={selectedDateOption?.withoutMeal || false}
              earlyDropoff={selectedDateOption?.earlyDropoff || false}
              onDateToggle={() => handleDateToggle(date)}
              onOptionChange={(option, value) => handleOptionChange(date, option, value)}
              isTeenClass={false}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};
