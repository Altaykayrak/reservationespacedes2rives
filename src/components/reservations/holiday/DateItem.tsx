
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { DateOptions } from "./DateOptions";
import { Skeleton } from "@/components/ui/skeleton";

interface DateItemProps {
  date: Date;
  isSelected: boolean;
  isReserved: boolean;
  withoutMeal: boolean;
  earlyDropoff: boolean;
  onDateToggle: () => void;
  onOptionChange: (option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  isTeenClass: boolean;
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
  isTeenClass,
  periodId,
  childSchoolClass
}: DateItemProps) => {
  if (!date || isNaN(date.getTime())) {
    console.error("Date invalide dans DateItem:", date);
    return null;
  }

  return (
    <div
      className={`relative space-y-1 p-2 rounded-lg transition-colors ${
        isSelected ? 'bg-green-50/60' : 'hover:bg-green-50/30'
      }`}
    >
      <div className="flex items-start gap-2">
        <Checkbox
          id={date.toISOString()}
          checked={isSelected}
          onCheckedChange={() => !isReserved && onDateToggle()}
          disabled={isReserved}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor={date.toISOString()}
              className={`cursor-pointer font-medium ${
                isReserved ? 'text-gray-500' : ''
              }`}
            >
              {format(date, "EEEE d MMMM yyyy", { locale: fr })}
            </Label>
          </div>
          <div className="mt-1">
            {isReserved && (
              <Badge variant="secondary" className="bg-red-100 text-red-600">
                Déjà réservé
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
