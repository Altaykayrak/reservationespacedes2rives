
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
  console.log("DateItem - Received childSchoolClass:", childSchoolClass);
  console.log("DateItem - childSchoolClass type:", typeof childSchoolClass);
  
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
          console.log('Changement détecté dans les places disponibles:', payload);
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

  const normalizeSchoolClass = (rawClass: string): string | null => {
    console.log("normalizeSchoolClass - Input:", rawClass);
    
    if (!rawClass?.trim()) {
      console.log("normalizeSchoolClass - Empty or null input");
      return null;
    }
    
    const cleanedClass = rawClass.trim();
    console.log("normalizeSchoolClass - Cleaned class:", cleanedClass);
    
    // Classes maternelles
    if (cleanedClass.toUpperCase() === "PETITE SECTION") {
      console.log("normalizeSchoolClass - Converted PS");
      return "PS";
    }
    if (cleanedClass.toUpperCase() === "MOYENNE SECTION") {
      console.log("normalizeSchoolClass - Converted MS");
      return "MS";
    }
    if (cleanedClass.toUpperCase() === "GRANDE SECTION") {
      console.log("normalizeSchoolClass - Converted GS");
      return "GS";
    }

    // Abréviations maternelles
    if (["PS", "MS", "GS"].includes(cleanedClass.toUpperCase())) {
      const result = cleanedClass.toUpperCase();
      console.log("normalizeSchoolClass - Using abbreviation:", result);
      return result;
    }

    // Classes primaires
    if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(cleanedClass)) {
      console.log("normalizeSchoolClass - Primary class:", cleanedClass);
      return cleanedClass;
    }

    // Classes collège/lycée exactes
    if (["6ème", "5ème", "4ème", "3ème", "Seconde", "Première", "Terminale"].includes(cleanedClass)) {
      console.log("normalizeSchoolClass - Exact teen class:", cleanedClass);
      return cleanedClass;
    }

    // Conversion des formats alternatifs pour collège/lycée
    const teenClassMapping: { [key: string]: string } = {
      "6EME": "6ème",
      "5EME": "5ème",
      "4EME": "4ème",
      "3EME": "3ème",
      "SECONDE": "Seconde",
      "PREMIERE": "Première",
      "TERMINALE": "Terminale"
    };

    const mappedClass = teenClassMapping[cleanedClass.toUpperCase()];
    console.log("normalizeSchoolClass - Mapped teen class:", mappedClass);
    return mappedClass || null;
  };

  const { data: spotsLeft, isLoading, isError } = useQuery({
    queryKey: ["spots_left", periodId, date.toISOString(), childSchoolClass],
    queryFn: async () => {
      console.log("queryFn - Starting with childSchoolClass:", childSchoolClass);
      const normalizedClass = normalizeSchoolClass(childSchoolClass);
      
      if (!normalizedClass) {
        console.error("queryFn - Classe scolaire invalide:", childSchoolClass);
        return null;
      }

      console.log("queryFn - Vérification des places pour:", {
        periodId,
        date: format(date, 'yyyy-MM-dd'),
        childSchoolClass: normalizedClass
      });

      try {
        const { data: spotCount, error } = await supabase
          .rpc('check_holiday_spots_available', {
            period_id: periodId,
            reservation_date: format(date, 'yyyy-MM-dd'),
            child_school_class: normalizedClass,
          });

        if (error) {
          console.error("queryFn - Erreur lors de la vérification des places:", error);
          return null;
        }

        console.log("queryFn - Places restantes pour", normalizedClass, ":", spotCount);
        return spotCount;
      } catch (error) {
        console.error("queryFn - Erreur lors de la vérification des places:", error);
        return null;
      }
    },
    enabled: Boolean(periodId) && Boolean(childSchoolClass?.trim()),
    retry: false,
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
