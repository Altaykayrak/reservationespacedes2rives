
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateCheckbox } from "@/components/ui/date-checkbox";
import { DateOptions } from "./DateOptions";
import { useHolidaySpots } from "@/hooks/useHolidaySpots";

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
  isDisabled?: boolean;
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
  childSchoolClass,
  isDisabled = false
}: DateItemProps) => {
  const { availableSpots, isFull } = useHolidaySpots(periodId, date, childSchoolClass);
  
  // Disable the date if it's full and not already reserved
  const shouldDisable = isDisabled || (isFull && !isReserved);

  return (
    <div className="flex-1">
      <div className="flex items-center space-x-3">
        <DateCheckbox
          checked={isSelected}
          onCheckedChange={onDateToggle}
          disabled={shouldDisable}
        />
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${shouldDisable ? 'text-gray-400' : ''}`}>
            {format(date, "EEEE d MMMM yyyy", { locale: fr })}
          </span>
          {shouldDisable && !isReserved && (
            <span className="text-xs text-red-500">
              Journée complète
            </span>
          )}
        </div>
      </div>
      
      {isSelected && !isTeenClass && (
        <div className="mt-2 ml-6">
          <DateOptions
            withoutMeal={withoutMeal}
            earlyDropoff={earlyDropoff}
            onOptionChange={onOptionChange}
          />
        </div>
      )}
    </div>
  );
};
