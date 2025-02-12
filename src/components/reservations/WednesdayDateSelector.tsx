
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addHours } from "date-fns";
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

interface WednesdayDateSelectorProps {
  selectedDates: DateOption[];
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

  const { data: childInfo } = useQuery({
    queryKey: ["selectedChild"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const isKindergarten = childInfo?.school_class && ["PS", "MS", "GS"].includes(childInfo.school_class);
  const isPrimary = childInfo?.school_class && ["CP", "CE1", "CE2", "CM1", "CM2"].includes(childInfo.school_class);

  const { data: availableWednesdays = [], isLoading, error } = useQuery({
    queryKey: ["available_wednesdays", childInfo?.school_class],
    queryFn: async () => {
      console.log('Fetching wednesdays data...');
      
      // Première requête pour les mercredis disponibles
      const { data: wednesdays, error: wednesdaysError } = await supabase
        .from("available_wednesdays")
        .select()
        .gte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (wednesdaysError) throw wednesdaysError;
      if (!wednesdays) return [];

      console.log('Fetched wednesdays:', wednesdays);

      // Deuxième requête pour toutes les réservations de ces mercredis
      const wednesdayIds = wednesdays.map(w => w.id);
      const { data: reservationsData, error: reservationsError } = await supabase
        .from("reservations")
        .select(`
          id,
          wednesday_id,
          children (
            id,
            school_class
          )
        `)
        .in('wednesday_id', wednesdayIds);

      if (reservationsError) throw reservationsError;
      console.log('Fetched reservations:', reservationsData);

      // Traitement des données
      return wednesdays.map(wednesday => {
        const wednesdayReservations = (reservationsData || [])
          .filter(r => r.wednesday_id === wednesday.id);

        const kindergartenCount = wednesdayReservations.filter(r => 
          r.children && ["PS", "MS", "GS"].includes(r.children.school_class)
        ).length;

        const primaryCount = wednesdayReservations.filter(r => 
          r.children && ["CP", "CE1", "CE2", "CM1", "CM2"].includes(r.children.school_class)
        ).length;

        // Log détaillé pour chaque mercredi
        console.log(`Wednesday ${wednesday.date} stats:`, {
          date: wednesday.date,
          reservations: wednesdayReservations.map(r => ({
            id: r.id,
            schoolClass: r.children?.school_class
          })),
          kindergartenCount,
          primaryCount,
          maxKindergarten: wednesday.max_participants_kindergarten,
          maxPrimary: wednesday.max_participants_primary,
          totalReservations: wednesdayReservations.length
        });

        return {
          ...wednesday,
          kindergartenReservations: kindergartenCount,
          primaryReservations: primaryCount,
          isFull: isKindergarten ? 
            kindergartenCount >= wednesday.max_participants_kindergarten :
            primaryCount >= wednesday.max_participants_primary
        };
      }).filter(wednesday => {
        const wednesdayDate = new Date(wednesday.date);
        return wednesdayDate >= minDate;
      });
    },
    enabled: !!childInfo,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Une erreur est survenue lors du chargement des dates
      </div>
    );
  }

  if (!availableWednesdays.length) {
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
          const selectedDateOption = selectedDates.find(
            (d) => d.date.getTime() === date.getTime()
          );
          const isReserved = isDateAlreadyReserved(date);
          const isDisabled = isReserved || wednesday.isFull;

          const kindergartenSpots = wednesday.max_participants_kindergarten - wednesday.kindergartenReservations;
          const primarySpots = wednesday.max_participants_primary - wednesday.primaryReservations;

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
                    {isDisabled ? (
                      <span className="text-gray-600">
                        {isReserved ? "(Déjà réservé)" : "Complet"}
                      </span>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="block text-green-600">
                          Maternelles : {kindergartenSpots} places restantes
                        </span>
                        <span className="block text-green-600">
                          Primaires : {primarySpots} places restantes
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {selectedDateOption && !isDisabled && (
                <div className="ml-6 space-y-1 bg-white/50 p-2 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`without-meal-${wednesday.date}`}
                      checked={selectedDateOption.withoutMeal}
                      onCheckedChange={(checked) =>
                        handleOptionChange(date, 'withoutMeal', checked as boolean)
                      }
                      className="border-green-200"
                    />
                    <Label 
                      htmlFor={`without-meal-${wednesday.date}`}
                      className="text-sm text-green-900"
                    >
                      Sans repas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`early-dropoff-${wednesday.date}`}
                      checked={selectedDateOption.earlyDropoff}
                      onCheckedChange={(checked) =>
                        handleOptionChange(date, 'earlyDropoff', checked as boolean)
                      }
                      className="border-green-200"
                    />
                    <Label 
                      htmlFor={`early-dropoff-${wednesday.date}`}
                      className="text-sm text-green-900"
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
