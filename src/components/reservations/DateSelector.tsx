import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface DateSelectorProps {
  selectedPeriod: string;
  selectedDates: DateOption[];
  holidayPeriods?: Tables<"available_holiday_periods">[] | null;
  handleDateToggle: (date: Date) => void;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  isDateAlreadyReserved: (date: Date) => boolean;
}

export const DateSelector = ({
  selectedPeriod,
  selectedDates,
  holidayPeriods,
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved
}: DateSelectorProps) => {
  if (!selectedPeriod) return null;

  const period = holidayPeriods?.find(p => p.id === selectedPeriod);
  if (!period) return null;

  const startDate = new Date(period.start_date);
  const endDate = new Date(period.end_date);
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return (
    <div className="space-y-4">
      {dates.map((date) => {
        const selectedDate = selectedDates.find(d => 
          format(d.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        const isReserved = isDateAlreadyReserved(date);

        return (
          <div key={date.toISOString()} className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50">
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={date.toISOString()}
                  checked={!!selectedDate}
                  onCheckedChange={() => handleDateToggle(date)}
                  disabled={isReserved}
                  className="h-5 w-5"
                />
                <Label 
                  htmlFor={date.toISOString()} 
                  className={`text-base ${isReserved ? "text-gray-400" : "text-gray-900"}`}
                >
                  {format(date, "EEEE d MMMM", { locale: fr })}
                  {isReserved && " (déjà réservé)"}
                </Label>
              </div>

              {selectedDate && (
                <div className="ml-7 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`without-meal-${date.toISOString()}`}
                      checked={selectedDate.withoutMeal}
                      onCheckedChange={(checked) => {
                        console.log("Without meal checked:", checked);
                        if (typeof checked === 'boolean') {
                          handleOptionChange(date, 'withoutMeal', checked);
                        }
                      }}
                      className="h-4 w-4"
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
                      onCheckedChange={(checked) => {
                        console.log("Early dropoff checked:", checked);
                        if (typeof checked === 'boolean') {
                          handleOptionChange(date, 'earlyDropoff', checked);
                        }
                      }}
                      className="h-4 w-4"
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
          </div>
        );
      })}
    </div>
  );
};