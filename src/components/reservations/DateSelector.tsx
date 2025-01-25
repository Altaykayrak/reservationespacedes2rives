import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface DateSelectorProps {
  selectedDates: DateOption[];
  handleDateToggle: (date: Date) => void;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', checked: boolean) => void;
  isDateAlreadyReserved: (date: Date) => boolean;
}

export const DateSelector = ({
  selectedDates,
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved
}: DateSelectorProps) => {
  // Générer les 4 prochains mercredis
  const getNextWednesdays = () => {
    const wednesdays: Date[] = [];
    const today = new Date();
    let current = new Date(today);

    while (wednesdays.length < 4) {
      if (current.getDay() === 3) { // 3 représente mercredi
        if (current >= today) {
          wednesdays.push(new Date(current));
        }
      }
      current.setDate(current.getDate() + 1);
    }

    return wednesdays;
  };

  const nextWednesdays = getNextWednesdays();

  return (
    <div className="space-y-4">
      <Label>Sélectionnez les mercredis</Label>
      <ScrollArea className="h-[300px] rounded-md border p-4">
        <div className="space-y-4">
          {nextWednesdays.map((date) => {
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
      </ScrollArea>
    </div>
  );
};