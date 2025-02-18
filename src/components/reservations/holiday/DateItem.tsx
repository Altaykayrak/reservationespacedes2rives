
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateOptions } from "./DateOptions";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface DateItemProps {
  date: Date;
  isSelected: boolean;
  isReserved: boolean;
  withoutMeal: boolean;
  earlyDropoff: boolean;
  onDateToggle: () => void;
  onOptionChange: (option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  isTeenClass?: boolean;
  periodId: string;
  childSchoolClass: string;
}

const VALID_SCHOOL_CLASSES = ['PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'] as const;

const normalizeSchoolClass = (schoolClass: string): string | null => {
  if (!schoolClass?.trim()) {
    console.error("Classe scolaire manquante ou vide");
    return null;
  }
  
  // Nettoyer et mettre en majuscules
  const upperCleaned = schoolClass.trim().toUpperCase();
  
  // Mappage des noms complets et variations vers les formats acceptés
  const classMap: Record<string, string> = {
    'PETITE SECTION': 'PS',
    'MOYENNE SECTION': 'MS',
    'GRANDE SECTION': 'GS',
    'PS': 'PS',
    'MS': 'MS',
    'GS': 'GS',
    'CP': 'CP',
    'CE1': 'CE1',
    'CE2': 'CE2',
    'CM1': 'CM1',
    'CM2': 'CM2',
    '6EME': '6ème',
    '6IEME': '6ème',
    '6E': '6ème',
    '5EME': '5ème',
    '5IEME': '5ème',
    '5E': '5ème',
    '4EME': '4ème',
    '4IEME': '4ème',
    '4E': '4ème',
    '3EME': '3ème',
    '3IEME': '3ème',
    '3E': '3ème',
    'SECONDE': 'Seconde',
    '2NDE': 'Seconde',
    'PREMIERE': 'Première',
    '1ERE': 'Première',
    'TERMINALE': 'Terminale',
    'TERM': 'Terminale'
  };

  // Obtenir la classe normalisée
  const normalizedClass = classMap[upperCleaned];
  
  if (!normalizedClass) {
    console.error(`Classe non reconnue: ${schoolClass}, valeur originale: ${upperCleaned}`);
    return null;
  }
  
  // Vérifier si la classe normalisée est valide
  if (!VALID_SCHOOL_CLASSES.includes(normalizedClass as any)) {
    console.error(`Classe non valide: ${schoolClass} -> ${normalizedClass}`);
    return null;
  }
  
  console.log(`Classe normalisée avec succès: ${schoolClass} -> ${normalizedClass}`);
  return normalizedClass;
};

export const DateItem = ({
  date,
  isSelected,
  isReserved,
  withoutMeal,
  earlyDropoff,
  onDateToggle,
  onOptionChange,
  isTeenClass = false,
  periodId,
  childSchoolClass,
}: DateItemProps) => {
  console.log("DateItem - Props:", { childSchoolClass, periodId, date: date.toISOString() });
  
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('holiday-spots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'holiday_reservations'
        },
        (payload) => {
          queryClient.invalidateQueries({
            queryKey: ["spots_left", periodId, date.toISOString(), childSchoolClass]
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, periodId, date, childSchoolClass]);

  const { data: spotsLeft, isLoading, isError } = useQuery({
    queryKey: ["spots_left", periodId, date.toISOString(), childSchoolClass],
    queryFn: async () => {
      if (!childSchoolClass?.trim()) {
        console.error("Classe scolaire manquante");
        return null;
      }

      if (!periodId) {
        console.error("Period ID manquant");
        return null;
      }

      const normalizedClass = normalizeSchoolClass(childSchoolClass);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      console.log("Appel à check_holiday_spots_available avec:", {
        period_id: periodId,
        reservation_date: formattedDate,
        child_school_class: normalizedClass
      });

      if (!normalizedClass) {
        console.error("Classe normalisée invalide pour:", childSchoolClass);
        return null;
      }

      const { data: spotCount, error } = await supabase
        .rpc('check_holiday_spots_available', {
          period_id: periodId,
          reservation_date: formattedDate,
          child_school_class: normalizedClass
        });

      if (error) {
        console.error("Erreur avec les paramètres:", {
          period_id: periodId,
          reservation_date: formattedDate,
          child_school_class: normalizedClass
        });
        console.error("Erreur retournée:", error);
        throw error;
      }

      console.log("Résultat de la requête:", spotCount);
      return spotCount;
    },
    enabled: Boolean(periodId) && Boolean(childSchoolClass?.trim()),
    retry: 1,
    retryDelay: 1000,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  const getSpotsBadgeColor = (spots: number | null) => {
    if (spots === null) return "bg-gray-100 text-gray-600";
    if (spots <= 0) return "bg-red-100 text-red-800";
    if (spots <= 5) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  const getGroupName = (schoolClass: string) => {
    const normalizedClass = schoolClass.trim().toUpperCase();
    if (["PS", "MS", "GS", "PETITE SECTION", "MOYENNE SECTION", "GRANDE SECTION"].includes(normalizedClass)) 
      return 'maternelle';
    if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(normalizedClass)) 
      return 'primaire';
    return 'adolescent';
  };

  const isDisabled = isReserved || isTeenClass || (spotsLeft !== null && spotsLeft <= 0);

  const getSpotsBadgeText = (spots: number | null, schoolClass: string) => {
    if (spots === null) return "Vérification des places impossible";
    if (spots <= 0) return `Groupe ${getGroupName(schoolClass)} complet, contactez l'accueil si vous souhaitez être en liste d'attente`;
    return `${spots} place${spots > 1 ? 's' : ''} restante${spots > 1 ? 's' : ''}`;
  };

  return (
    <div 
      className={`relative space-y-1 p-2 rounded-lg transition-colors ${
        isReserved ? 'bg-gray-50' : 'bg-blue-50/30 hover:bg-blue-100/30'
      }`}
    >
      <div className="flex items-start gap-2">
        <Checkbox
          id={date.toISOString()}
          checked={isSelected}
          onCheckedChange={onDateToggle}
          disabled={isDisabled}
          className={`mt-1 ${isReserved ? 'border-gray-300' : 'border-blue-200'}`}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor={date.toISOString()}
              className={`cursor-pointer font-medium ${
                isDisabled ? 'text-gray-500' : 'text-blue-900'
              }`}
            >
              {format(date, "EEEE d MMMM yyyy", { locale: fr })}
            </Label>
            {isReserved && (
              <Badge variant="outline" className="text-[10px] md:text-xs">
                Déjà réservé
              </Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {!isLoading && childSchoolClass?.trim() && (
              <Badge 
                variant="secondary" 
                className={`${getSpotsBadgeColor(spotsLeft)} border-none text-[10px] md:text-xs`}
              >
                {getSpotsBadgeText(spotsLeft, childSchoolClass)}
              </Badge>
            )}
          </div>
        </div>
      </div>
      {isSelected && !isReserved && (
        <DateOptions
          date={date}
          withoutMeal={withoutMeal}
          earlyDropoff={earlyDropoff}
          onOptionChange={onOptionChange}
          isTeenClass={isTeenClass}
        />
      )}
    </div>
  );
};
