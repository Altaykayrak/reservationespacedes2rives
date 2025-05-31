
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

export const DateSelector = ({
  selectedDates,
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved,
}: DateSelectorProps) => {
  // Calculer la date limite : mardi précédent à 23h59
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Trouver le prochain mercredi ou le mercredi actuel
    const dayOfWeek = today.getDay(); // 0 = dimanche, 3 = mercredi
    
    // Si on est mardi ou avant, on peut encore réserver pour le mercredi de cette semaine
    // Si on est mercredi ou après, on ne peut plus réserver pour ce mercredi
    let nextWednesday = new Date(today);
    
    if (dayOfWeek <= 2) { // Dimanche (0), Lundi (1), Mardi (2)
      // On peut encore réserver pour le mercredi de cette semaine
      const daysUntilWednesday = 3 - dayOfWeek;
      nextWednesday.setDate(today.getDate() + daysUntilWednesday);
    } else {
      // On est mercredi ou après, le prochain mercredi disponible est la semaine suivante
      const daysUntilNextWednesday = 10 - dayOfWeek; // 7 jours + (3 - dayOfWeek)
      nextWednesday.setDate(today.getDate() + daysUntilNextWednesday);
    }
    
    return nextWednesday;
  };

  const minDate = getMinDate();

  const { data: availableWednesdays } = useQuery({
    queryKey: ["available_wednesdays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_wednesdays")
        .select("*")
        .order('date', { ascending: true });
      
      if (error) throw error;

      // Filtrer les dates selon la nouvelle règle
      return data?.filter(wednesday => {
        const wednesdayDate = new Date(wednesday.date);
        return wednesdayDate >= minDate;
      });
    },
  });

  if (!availableWednesdays || availableWednesdays.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        Aucun mercredi n'est disponible pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="font-medium block">Sélectionner les dates</Label>
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="space-y-3 pl-4">
          {availableWednesdays.map((wednesday) => {
            const date = new Date(wednesday.date);
            const isSelected = selectedDates.some(
              (d) => d.date.getTime() === date.getTime()
            );
            const isReserved = isDateAlreadyReserved(date);
            const selectedDate = selectedDates.find(
              (d) => d.date.getTime() === date.getTime()
            );

            return (
              <div key={wednesday.date} className="space-y-2">
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
    </div>
  );
};
