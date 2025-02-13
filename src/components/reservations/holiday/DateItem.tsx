
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateOptions } from "./DateOptions";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const { data: spotsLeft, isLoading } = useQuery({
    queryKey: ["spots_left", periodId, date.toISOString(), childSchoolClass],
    queryFn: async () => {
      console.log("Checking spots for:", {
        period_id: periodId,
        reservation_date: format(date, 'yyyy-MM-dd'),
        child_school_class: childSchoolClass,
      });

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

      console.log("Spots left response:", spotCount);
      return spotCount;
    },
    enabled: !!periodId && !!childSchoolClass,
  });

  const getSpotsBadgeColor = (spots: number | null) => {
    if (spots === null) return "bg-gray-100 text-gray-600";
    if (spots <= 0) return "bg-red-100 text-red-800";
    if (spots <= 5) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-1 bg-blue-50/30 p-2 rounded-lg hover:bg-blue-100/30 transition-colors">
      <div className="flex items-start gap-2">
        <Checkbox
          id={date.toISOString()}
          checked={isSelected}
          onCheckedChange={() => !isReserved && !isTeenClass && onDateToggle()}
          disabled={isReserved || isTeenClass || (spotsLeft !== null && spotsLeft <= 0)}
          className="border-blue-200 mt-1"
        />
        <div className="flex-1">
          <Label
            htmlFor={date.toISOString()}
            className={`cursor-pointer font-medium ${
              isReserved ? 'text-gray-500' : 'text-blue-900'
            }`}
          >
            {format(date, "EEEE d MMMM yyyy", { locale: fr })}
            {isReserved && (
              <span className="ml-2 text-sm text-gray-500">
                (Déjà réservé)
              </span>
            )}
          </Label>
          <div className="mt-1">
            {!isLoading && spotsLeft !== null && (
              <Badge 
                variant="secondary" 
                className={`${getSpotsBadgeColor(spotsLeft)} border-none`}
              >
                {spotsLeft <= 0 
                  ? "Complet" 
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
