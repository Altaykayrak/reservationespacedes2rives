import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateOptions } from "./DateOptions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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
  const { data: spotsLeft } = useQuery({
    queryKey: ["spots_left", periodId, date.toISOString(), childSchoolClass],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('check_holiday_spots_available', {
          period_id: periodId,
          reservation_date: format(date, 'yyyy-MM-dd'),
          child_school_class: childSchoolClass,
        });

      if (error) {
        console.error("Error checking spots available:", error);
        return null;
      }

      return data as number;
    },
    enabled: !!periodId && !!childSchoolClass,
  });

  return (
    <div className="space-y-1 bg-blue-50/30 p-2 rounded-lg hover:bg-blue-100/30 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={date.toISOString()}
          checked={isSelected}
          onCheckedChange={() => !isReserved && !isTeenClass && onDateToggle()}
          disabled={isReserved || isTeenClass}
          className="border-blue-200"
        />
        <Label
          htmlFor={date.toISOString()}
          className={`flex-1 cursor-pointer font-medium ${
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
