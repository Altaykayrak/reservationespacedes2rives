import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface DateSelectorProps {
  selectedDates: DateOption[];
  handleDateToggle: (date: Date) => void;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  isDateAlreadyReserved: (date: Date) => boolean;
  periodId: string | null;
}

const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const DateSelector = ({
  selectedDates,
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved,
  periodId
}: DateSelectorProps) => {
  const { data: holidayPeriods } = useQuery({
    queryKey: ["holiday_periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*")
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  if (!holidayPeriods || holidayPeriods.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        Aucune période de vacances n'est disponible pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="font-medium block">Sélectionner les dates</Label>
      <div className="space-y-6">
        {holidayPeriods.map((period) => {
          const startDate = new Date(period.start_date);
          const endDate = new Date(period.end_date);
          
          // Generate array of dates between start and end date, excluding weekends
          const dates = [];
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            if (!isWeekend(currentDate)) {
              dates.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }

          return (
            <div key={period.id} className="border rounded-lg p-4 bg-gray-50">
              <Label className="font-medium block mb-4">
                Période du {format(startDate, "d MMMM yyyy", { locale: fr })} au{" "}
                {format(endDate, "d MMMM yyyy", { locale: fr })}
              </Label>
              <div className="space-y-3 pl-4">
                {dates.map((date) => {
                  const isSelected = selectedDates.some(
                    (d) => d.date.getTime() === date.getTime()
                  );
                  const isReserved = isDateAlreadyReserved(date);
                  const selectedDate = selectedDates.find(
                    (d) => d.date.getTime() === date.getTime()
                  );

                  return (
                    <div key={date.toISOString()} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={date.toISOString()}
                          checked={isSelected}
                          disabled={isReserved}
                          onCheckedChange={() => handleDateToggle(date)}
                        />
                        <Label htmlFor={date.toISOString()}>
                          {format(date, "EEEE d MMMM", { locale: fr })}
                          {isReserved && (
                            <span className="ml-2 text-red-500 text-sm">
                              (Déjà réservé)
                            </span>
                          )}
                        </Label>
                      </div>
                      {selectedDate && (
                        <div className="ml-6 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`without-meal-${date.toISOString()}`}
                              checked={selectedDate.withoutMeal}
                              onCheckedChange={(checked) =>
                                handleOptionChange(date, "withoutMeal", checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={`without-meal-${date.toISOString()}`}
                              className="text-sm text-gray-600"
                            >
                              Sans repas
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`early-dropoff-${date.toISOString()}`}
                              checked={selectedDate.earlyDropoff}
                              onCheckedChange={(checked) =>
                                handleOptionChange(date, "earlyDropoff", checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={`early-dropoff-${date.toISOString()}`}
                              className="text-sm text-gray-600"
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
            </div>
          );
        })}
      </div>
    </div>
  );
};