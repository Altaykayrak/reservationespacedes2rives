
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "lucide-react";
import { useAvailableWednesdays } from "@/hooks/useAvailableWednesdays";
import { Badge } from "@/components/ui/badge";
import { WednesdayOptions } from "./WednesdayOptions";

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
  selectedChild: string;
}

export const WednesdayDateSelector = ({
  selectedDates = [],
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved,
  selectedChild,
}: WednesdayDateSelectorProps) => {
  const { data: childInfo } = useQuery({
    queryKey: ["selectedChild", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return null;
      
      const { data, error } = await supabase
        .from("children")
        .select("school_class")
        .eq("id", selectedChild)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedChild,
  });

  const isKindergarten = childInfo?.school_class && ["PS", "MS", "GS"].includes(childInfo.school_class);
  const isPrimary = childInfo?.school_class && ["CP", "CE1", "CE2", "CM1", "CM2"].includes(childInfo.school_class);

  const { data: availableWednesdays = [], isLoading, error } = useAvailableWednesdays(
    Boolean(isKindergarten),
    Boolean(isPrimary)
  );

  const getSpotsBadgeColor = (spots: number) => {
    if (spots <= 0) return "bg-red-100 text-red-800";
    if (spots <= 5) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  const getGroupName = (isKinder: boolean) => isKinder ? 'maternelle' : 'primaire';

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

          // Ne calculer les places restantes que si un enfant est sélectionné
          let spotsLeft = null;
          if (isKindergarten) {
            spotsLeft = wednesday.max_participants_kindergarten - wednesday.kindergartenReservations;
          } else if (isPrimary) {
            spotsLeft = wednesday.max_participants_primary - wednesday.primaryReservations;
          }

          const isDisabled = isReserved || (spotsLeft !== null && spotsLeft <= 0);

          return (
            <div
              key={wednesday.date}
              className="relative space-y-1 p-2 rounded-lg transition-colors bg-green-50/30 hover:bg-green-100/30"
            >
              <div className="flex items-start gap-2">
                <Checkbox
                  id={wednesday.date}
                  checked={!!selectedDateOption}
                  onCheckedChange={() => !isDisabled && handleDateToggle(date)}
                  disabled={isDisabled}
                  className="mt-1 border-green-200"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Label
                      htmlFor={wednesday.date}
                      className={`cursor-pointer font-medium ${
                        isDisabled ? 'text-gray-500' : 'text-green-900'
                      }`}
                    >
                      {format(date, "EEEE d MMMM yyyy", { locale: fr })}
                    </Label>
                  </div>
                  <div className="mt-1">
                    {!selectedChild && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        Sélectionnez un enfant
                      </Badge>
                    )}
                    {selectedChild && isReserved ? (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        Déjà réservé
                      </Badge>
                    ) : selectedChild && spotsLeft !== null && (
                      <Badge 
                        variant="secondary" 
                        className={`${getSpotsBadgeColor(spotsLeft)} border-none`}
                      >
                        {spotsLeft <= 0 
                          ? `Groupe ${getGroupName(Boolean(isKindergarten))} complet` 
                          : `${spotsLeft} place${spotsLeft > 1 ? 's' : ''} restante${spotsLeft > 1 ? 's' : ''}`
                        }
                      </Badge>
                    )}
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
