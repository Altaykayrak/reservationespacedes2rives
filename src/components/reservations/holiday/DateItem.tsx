
import { DateCheckbox } from "@/components/ui/date-checkbox";
import { DateOptions } from "./DateOptions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useHolidaySpots } from "@/hooks/useHolidaySpots";
import { SpotsBadge } from "./SpotsBadge";

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
  const formattedDate = format(date, "dd MMMM", { locale: fr });
  const dayOfWeek = format(date, "EEEE", { locale: fr });

  // Use the hook to check for available spots
  const { availableSpots, isFull, isLoading } = useHolidaySpots(
    periodId,
    date,
    childSchoolClass
  );

  // Log detailed spot information
  console.log(`DateItem for ${formattedDate}:`, { 
    availableSpots, 
    isFull, 
    isLoading, 
    childSchoolClass,
    periodId
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex gap-2 items-center">
            <span className="font-semibold">{dayOfWeek}</span>
            <span>{formattedDate}</span>
          </div>
          
          {/* Add SpotsBadge component to display availability */}
          <div className="mt-1">
            <SpotsBadge 
              availableSpots={availableSpots}
              isFull={isFull}
              schoolClass={childSchoolClass}
              isLoading={isLoading}
            />
          </div>
        </div>
        <DateCheckbox
          checked={isSelected}
          disabled={isReserved}
          onCheckedChange={onDateToggle}
        />
      </div>
      {isSelected && (
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
