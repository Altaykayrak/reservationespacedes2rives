import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addHours } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "lucide-react";

interface WednesdayDateSelectorProps {
  selectedDates: Date[];
  handleDateToggle: (date: Date) => void;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  isDateAlreadyReserved: (date: Date) => boolean;
}

export const WednesdayDateSelector = ({
  selectedDates,
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved,
}: WednesdayDateSelectorProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = addHours(today, 72);

  const { data: availableWednesdays } = useQuery({
    queryKey: ["available_wednesdays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_wednesdays")
        .select("*")
        .gte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: true });
      
      if (error) throw error;

      // Filtrer les dates qui sont dans moins de 72 heures
      return data?.filter(wednesday => {
        const wednesdayDate = new Date(wednesday.date);
        return wednesdayDate >= minDate;
      });
    },
  });

  if (!availableWednesdays || availableWednesdays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Calendar className="h-12 w-12 text-muted-foreground" />
        <div>
          <h3 className="font-semibold">Aucun mercredi disponible</h3>
          <p className="text-sm text-muted-foreground">
            Il n'y a pas de mercredis disponibles pour le moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {availableWednesdays.map((wednesday) => {
          const date = new Date(wednesday.date);
          const isSelected = selectedDates.some(
            (d) => d.getTime() === date.getTime()
          );
          const isReserved = isDateAlreadyReserved(date);

          return (
            <div
              key={wednesday.date}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isReserved ? 'opacity-50 bg-gray-100' : 'hover:bg-secondary/50'
              }`}
            >
              <Checkbox
                id={wednesday.date}
                checked={isSelected}
                onCheckedChange={() => !isReserved && handleDateToggle(date)}
                disabled={isReserved}
              />
              <Label
                htmlFor={wednesday.date}
                className={`flex-1 cursor-pointer font-medium ${
                  isReserved ? 'text-gray-500' : ''
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
          );
        })}
      </div>
    </ScrollArea>
  );
};