
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

interface WednesdayWithCounts {
  id: string;
  date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
  kindergartenReservations: number;
  primaryReservations: number;
  isFull: boolean;
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

  // On charge d'abord les infos de l'enfant
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

  // Requête pour les mercredis disponibles avec leurs réservations
  const { data: availableWednesdays = [], isLoading, error } = useQuery<WednesdayWithCounts[]>({
    queryKey: ["available_wednesdays"],
    queryFn: async () => {
      console.log('Démarrage de la requête pour les mercredis disponibles');
      
      // Récupération des mercredis
      const { data: wednesdays, error: wednesdaysError } = await supabase
        .from("available_wednesdays")
        .select(`
          id,
          date,
          max_participants_kindergarten,
          max_participants_primary
        `)
        .gte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (wednesdaysError) {
        console.error('Erreur lors de la récupération des mercredis:', wednesdaysError);
        throw wednesdaysError;
      }

      if (!wednesdays) return [];

      console.log('Mercredis récupérés:', wednesdays);

      // Récupération de TOUTES les réservations pour ces dates
      const { data: reservations, error: reservationsError } = await supabase
        .from("reservations")
        .select(`
          id,
          wednesday_id,
          reservation_date,
          children ( school_class )
        `)
        .or(`wednesday_id.in.(${wednesdays.map(w => w.id).join(',')}),reservation_date.in.(${wednesdays.map(w => w.date).join(',')})`);

      if (reservationsError) {
        console.error('Erreur lors de la récupération des réservations:', reservationsError);
        throw reservationsError;
      }

      console.log('Toutes les réservations récupérées:', reservations);

      // Traitement des données pour chaque mercredi
      return wednesdays.map(wednesday => {
        // Filtrer les réservations pour ce mercredi (soit par wednesday_id, soit par date)
        const wednesdayReservations = (reservations || []).filter(r => 
          r.wednesday_id === wednesday.id || 
          r.reservation_date === wednesday.date
        );
        
        console.log(`Réservations pour le mercredi ${wednesday.date}:`, wednesdayReservations);
        
        // Compter les réservations par type
        const kindergartenCount = wednesdayReservations.filter(reservation => 
          reservation.children?.school_class && 
          ["PS", "MS", "GS"].includes(reservation.children.school_class)
        ).length;

        const primaryCount = wednesdayReservations.filter(reservation => 
          reservation.children?.school_class && 
          ["CP", "CE1", "CE2", "CM1", "CM2"].includes(reservation.children.school_class)
        ).length;

        console.log(`Stats pour le mercredi ${wednesday.date}:`, {
          kindergartenCount,
          primaryCount,
          maxKindergarten: wednesday.max_participants_kindergarten,
          maxPrimary: wednesday.max_participants_primary
        });

        const processedWednesday: WednesdayWithCounts = {
          id: wednesday.id,
          date: wednesday.date,
          max_participants_kindergarten: wednesday.max_participants_kindergarten,
          max_participants_primary: wednesday.max_participants_primary,
          kindergartenReservations: kindergartenCount,
          primaryReservations: primaryCount,
          isFull: isKindergarten 
            ? kindergartenCount >= wednesday.max_participants_kindergarten
            : primaryCount >= wednesday.max_participants_primary
        };

        return processedWednesday;
      }).filter(wednesday => {
        const wednesdayDate = new Date(wednesday.date);
        return wednesdayDate >= minDate;
      });
    },
  });

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
    console.log('Aucun mercredi disponible trouvé');
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

  console.log('Mercredis disponibles à afficher:', availableWednesdays);

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

          // Calcul des places restantes
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
