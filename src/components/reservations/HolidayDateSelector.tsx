import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "lucide-react";

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
}

export const HolidayDateSelector = ({
  selectedDates,
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved,
  periodId
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

  if (!holidayPeriod) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
        <Calendar className="h-12 w-12 text-muted-foreground" />
        <div>
          <h3 className="font-semibold">Sélectionnez une période</h3>
          <p className="text-sm text-muted-foreground">
            Veuillez d'abord sélectionner une période de vacances.
          </p>
        </div>
      </div>
    );
  }

  // Générer un tableau de dates entre start_date et end_date
  const dates: Date[] = [];
  const startDate = new Date(holidayPeriod.start_date);
  const endDate = new Date(holidayPeriod.end_date);
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Exclure les weekends
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (dates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
        <Calendar className="h-12 w-12 text-muted-foreground" />
        <div>
          <h3 className="font-semibold">Aucune date disponible</h3>
          <p className="text-sm text-muted-foreground">
            Il n'y a pas de dates disponibles pour cette période.
          </p>
        </div>
      </div>
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
            <div key={date.toISOString()} className="space-y-1 bg-blue-50/30 p-2 rounded-lg hover:bg-blue-100/30 transition-colors">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={date.toISOString()}
                  checked={!!selectedDateOption}
                  onCheckedChange={() => !isReserved && handleDateToggle(date)}
                  disabled={isReserved}
                  className="border-blue-200"
                />
                <Label
                  htmlFor={date.toISOString()}
                  className={`flex-1 cursor-pointer font-medium ${
                    isReserved ? 'text-gray-500' : 'text-blue-900'
                  }`}
                >
                  {format(date, "EEEE d MMMM yyyy", { locale: fr })}
                  {isReserved && (
                    <span className="ml-2 text-sm text-gray-500">
                      (Déjà réservé)
                    </span>
                  )}
                </Label>
              </div>
              {selectedDateOption && !isReserved && (
                <div className="ml-6 space-y-1 bg-white/50 p-2 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`without-meal-${date.toISOString()}`}
                      checked={selectedDateOption.withoutMeal}
                      onCheckedChange={(checked) =>
                        handleOptionChange(date, 'withoutMeal', checked as boolean)
                      }
                      className="border-blue-200"
                    />
                    <Label 
                      htmlFor={`without-meal-${date.toISOString()}`}
                      className="text-sm text-blue-900"
                    >
                      Sans repas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`early-dropoff-${date.toISOString()}`}
                      checked={selectedDateOption.earlyDropoff}
                      onCheckedChange={(checked) =>
                        handleOptionChange(date, 'earlyDropoff', checked as boolean)
                      }
                      className="border-blue-200"
                    />
                    <Label 
                      htmlFor={`early-dropoff-${date.toISOString()}`}
                      className="text-sm text-blue-900"
                    >
                      Accueil avant 8h30
                    </Label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};