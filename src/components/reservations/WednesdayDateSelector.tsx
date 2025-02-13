
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "lucide-react";
import { useAvailableWednesdays } from "@/hooks/useAvailableWednesdays";
import { WednesdayAvailability } from "./WednesdayAvailability";
import { WednesdayOptions } from "./WednesdayOptions";
import { useEffect } from "react";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface WednesdayDateSelectorProps {
  selectedDates: DateOption[];
  handleDateToggle: (date: Date) => void;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  isDateAlreadyReserved: (date: Date) => boolean;
}

export const WednesdayDateSelector = ({
  selectedDates = [],
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved,
}: WednesdayDateSelectorProps) => {
  const { data: childInfo } = useQuery({
    queryKey: ["selectedChild"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("school_class")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const isKindergarten = childInfo?.school_class && ["PS", "MS", "GS"].includes(childInfo.school_class);
  const isPrimary = childInfo?.school_class && ["CP", "CE1", "CE2", "CM1", "CM2"].includes(childInfo.school_class);

  const { data: availableWednesdays = [], isLoading, error, refetch } = useAvailableWednesdays(!!isKindergarten, !!isPrimary);

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wednesday_reservations'
        },
        (payload) => {
          console.log('Changement détecté dans les réservations:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    console.error('Erreur dans le composant:', error);
    return (
      <div className="text-center p-4 text-red-500">
        Une erreur est survenue lors du chargement des dates
      </div>
    );
  }

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
    <ScrollArea className="h-[300px] pr-3">
      <div className="space-y-1">
        {availableWednesdays.map((wednesday) => {
          const date = new Date(wednesday.date);
          const selectedDateOption = selectedDates?.find(
            (d) => d.date.getTime() === date.getTime()
          );
          const isReserved = isDateAlreadyReserved(date);
          const isDisabled = isReserved || wednesday.isFull;

          return (
            <div
              key={wednesday.date}
              className="space-y-1 bg-green-50/30 p-2 rounded-lg hover:bg-green-100/30 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={wednesday.date}
                  checked={!!selectedDateOption}
                  onCheckedChange={() => !isDisabled && handleDateToggle(date)}
                  disabled={isDisabled}
                  className="border-green-200"
                />
                <div className="flex flex-col">
                  <Label
                    htmlFor={wednesday.date}
                    className={`flex-1 cursor-pointer font-medium ${
                      isDisabled ? 'text-gray-500' : 'text-green-900'
                    }`}
                  >
                    {format(date, "EEEE d MMMM yyyy", { locale: fr })}
                  </Label>
                  <div className="text-sm space-y-0.5">
                    <WednesdayAvailability
                      wednesday={wednesday}
                      isDisabled={isDisabled}
                      isReserved={isReserved}
                    />
                  </div>
                </div>
              </div>
              {selectedDateOption && !isDisabled && (
                <WednesdayOptions
                  date={date}
                  withoutMeal={selectedDateOption.withoutMeal}
                  earlyDropoff={selectedDateOption.earlyDropoff}
                  onOptionChange={handleOptionChange}
                />
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
