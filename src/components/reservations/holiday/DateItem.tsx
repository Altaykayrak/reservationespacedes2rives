
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

  const { data: spotsLeft, isLoading } = useQuery({
    queryKey: ["spots_left", periodId, date.toISOString(), childSchoolClass],
    queryFn: async () => {
      if (!childSchoolClass) return null;

      try {
        const { data: spotCount, error } = await supabase
          .rpc('check_holiday_spots_available', {
            period_id: periodId,
            reservation_date: format(date, 'yyyy-MM-dd'),
            child_school_class: childSchoolClass,
          });

        if (error) {
          console.error("Error checking spots available:", error);
          return null;
        }

        console.log("Spots left for", childSchoolClass, ":", spotCount);
        return spotCount;
      } catch (error) {
        console.error("Error in spots check:", error);
        return null;
      }
    },
    enabled: !!periodId && !!childSchoolClass,
  });

  const getSpotsBadgeColor = (spots: number | null) => {
    if (spots === null) return "bg-gray-100 text-gray-600";
    if (spots <= 0) return "bg-red-100 text-red-800";
    if (spots <= 5) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  const getGroupName = (schoolClass: string) => {
    if (["PS", "MS", "GS", "Petite Section", "Moyenne Section", "Grande Section"].includes(schoolClass)) 
      return 'maternelle';
    if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(schoolClass)) 
      return 'primaire';
    return 'adolescent';
  };

  const isDisabled = isReserved || isTeenClass || (spotsLeft !== null && spotsLeft <= 0);

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
            {!isLoading && spotsLeft !== null && !isReserved && (
              <Badge 
                variant="secondary" 
                className={`${getSpotsBadgeColor(spotsLeft)} border-none text-[10px] md:text-xs`}
              >
                {spotsLeft <= 0 
                  ? `Groupe ${getGroupName(childSchoolClass)} complet, contactez l'accueil si vous souhaitez être en liste d'attente`
                  : `${spotsLeft} place${spotsLeft > 1 ? 's' : ''} restante${spotsLeft > 1 ? 's' : ''}`
                }
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
