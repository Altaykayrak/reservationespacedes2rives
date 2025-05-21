
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateOptions } from "./DateOptions";
import { Badge } from "@/components/ui/badge";

interface DateItemProps {
  date: Date;
  isSelected: boolean;
  isReserved: boolean;
  withoutMeal: boolean;
  earlyDropoff: boolean;
  onDateToggle: () => void;
  onOptionChange: (option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  isTeenClass?: boolean;
  periodId?: string;
  childSchoolClass?: string;
  isDisabled?: boolean; // New prop to handle full dates
}

export const DateItem: React.FC<DateItemProps> = ({
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
  isDisabled = false // Default to false
}) => {
  // Formatter la date pour l'affichage
  const formattedDate = format(date, 'EEEE d MMMM', { locale: fr });
  
  // Premier caractère en majuscule
  const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  
  const handleToggle = () => {
    if (isDisabled && !isReserved) return; // Don't allow toggle when disabled and not already reserved
    onDateToggle();
  };
  
  return (
    <div className="flex items-center flex-1 ml-2">
      <div 
        className={`flex items-center cursor-pointer ${isDisabled && !isReserved ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={handleToggle}
      >
        <Checkbox
          id={`date-${date.toISOString()}`}
          checked={isSelected}
          className="mr-2"
          disabled={isDisabled && !isReserved}
        />
        <label
          htmlFor={`date-${date.toISOString()}`}
          className="cursor-pointer flex flex-col sm:flex-row sm:items-center gap-1"
        >
          <span>{displayDate}</span>
          
          {isReserved && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800 ml-1 text-[10px]">
              Déjà réservé
            </Badge>
          )}
          
          {isDisabled && !isReserved && (
            <Badge variant="outline" className="bg-red-100 text-red-800 ml-1 text-[10px]">
              Complet
            </Badge>
          )}
        </label>
      </div>
      
      {isSelected && (
        <DateOptions
          withoutMeal={withoutMeal}
          earlyDropoff={earlyDropoff}
          onOptionChange={onOptionChange}
          isTeenClass={isTeenClass}
        />
      )}
    </div>
  );
};
