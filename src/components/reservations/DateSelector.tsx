import { format, addDays, isBefore, isAfter } from "date-fns";
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

export const DateSelector = ({
  selectedDates,
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved,
  periodId
}: DateSelectorProps) => {
  const { data: availableWednesdays } = useQuery({
    queryKey: ["available_wednesdays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_wednesdays")
        .select(`
          *,
          wednesday_allowed_classes (
            school_class
          )
        `)
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  if (!availableWednesdays || availableWednesdays.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        Aucun mercredi n'est disponible pour le moment.
      </div>
    );
  }

  const today = new Date();
  const minimumDate = addDays(today, 3); // Date minimum de réservation (aujourd'hui + 3 jours)

  // Filtrer les mercredis qui sont après la date minimum et qui ne sont pas passés
  const filteredWednesdays = availableWednesdays.filter(wednesday => {
    const wednesdayDate = new Date(wednesday.date);
    return isAfter(wednesdayDate, minimumDate) && isAfter(wednesdayDate, today);
  });

  if (filteredWednesdays.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        Aucun mercredi n'est disponible pour le moment. Les réservations doivent être faites au moins 3 jours à l'avance.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="font-medium block">Sélectionner les dates</Label>
      <div className="space-y-2">
        {filteredWednesdays.map((wednesday) => {
          const date = new Date(wednesday.date);
          const isSelected = selectedDates.some(
            (d) => d.date.getTime() === date.getTime()
          );
          const isReserved = isDateAlreadyReserved(date);

          const selectedDate = selectedDates.find(
            (d) => d.date.getTime() === date.getTime()
          );

          return (
            <div key={wednesday.id} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={wednesday.date}
                  checked={isSelected}
                  disabled={isReserved}
                  onCheckedChange={() => handleDateToggle(date)}
                />
                <Label htmlFor={wednesday.date}>
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
                      id={`without-meal-${wednesday.date}`}
                      checked={selectedDate.withoutMeal}
                      onCheckedChange={(checked) =>
                        handleOptionChange(date, "withoutMeal", checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`without-meal-${wednesday.date}`}
                      className="text-sm text-gray-600"
                    >
                      Sans repas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`early-dropoff-${wednesday.date}`}
                      checked={selectedDate.earlyDropoff}
                      onCheckedChange={(checked) =>
                        handleOptionChange(date, "earlyDropoff", checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`early-dropoff-${wednesday.date}`}
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
};