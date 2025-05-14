
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateOptions } from "./DateOptions";
import { Badge } from "@/components/ui/badge";
import { SpotsBadge } from "./SpotsBadge";
import { useHolidaySpots } from "@/hooks/useHolidaySpots";
import { normalizeSchoolClass } from "@/utils/schoolClassUtils";
import { useState } from "react";

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
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  try {
    // Vérifier si la date est une instance valide de Date
    const isValidDate = date instanceof Date && !isNaN(date.getTime());
    if (!isValidDate) {
      console.error("DateItem - Date invalide reçue:", date);
      return (
        <div className="p-2 bg-red-50 rounded-lg">
          <p className="text-red-500">Erreur: date invalide</p>
        </div>
      );
    }
    
    const normalizedClass = normalizeSchoolClass(childSchoolClass);
    
    // S'assurer que la date est une instance de Date
    const safeDate = date;
    const formattedDate = format(safeDate, "yyyy-MM-dd");
    
    const { data: spotsLeft, isLoading } = useHolidaySpots(periodId, safeDate, normalizedClass);
    
    // La date doit être désactivée uniquement si elle est déjà réservée OU si spotsLeft est strictement égal à 0
    const isDisabled = isReserved || (typeof spotsLeft === 'number' && spotsLeft === 0);

    // Fonction de gestion de clic
    const handleDateClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDisabled) {
        onDateToggle();
      }
    };

    return (
      <div 
        className={`relative space-y-1 p-2 rounded-lg transition-all duration-200 ${
          isDisabled ? 'bg-gray-50 opacity-75 cursor-not-allowed' :
          isReserved ? 'bg-gray-50' :
          isSelected ? 'bg-blue-100/60' :
          isHovered || isFocused ? 'bg-blue-50/80' : 'bg-blue-50/30'
        } ${!isDisabled ? 'cursor-pointer hover:shadow-sm active:scale-[0.99] transform' : ''}`}
        onClick={handleDateClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        data-state={isSelected ? 'selected' : 'deselected'}
      >
        <div className="flex items-start gap-2" onClick={handleDateClick}>
          <div className="mt-1">
            <Checkbox
              id={safeDate.toISOString()}
              checked={isSelected}
              onCheckedChange={() => !isDisabled && onDateToggle()}
              disabled={isDisabled}
              className={`
                ${isReserved ? 'border-gray-300' : 'border-blue-200'} 
                pointer-events-auto
                ${isSelected ? 'border-primary' : ''}
              `}
              onClick={(e) => {
                e.stopPropagation();
                !isDisabled && onDateToggle();
              }}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <Label
                htmlFor={safeDate.toISOString()}
                className={`font-medium ${
                  isDisabled ? 'text-gray-500' : isSelected ? 'text-blue-800' : 'text-blue-900'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  !isDisabled && onDateToggle();
                }}
              >
                {format(safeDate, "EEEE d MMMM yyyy", { locale: fr })}
              </Label>
              {isReserved && (
                <Badge variant="outline" className="text-[10px] md:text-xs whitespace-nowrap">
                  Déjà réservé
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-2">
              <SpotsBadge 
                spots={spotsLeft}
                schoolClass={normalizedClass}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
        {isSelected && !isReserved && (
          <DateOptions
            date={safeDate}
            withoutMeal={withoutMeal}
            earlyDropoff={earlyDropoff}
            onOptionChange={onOptionChange}
            isTeenClass={isTeenClass}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error("Erreur dans le rendu de DateItem:", error);
    return (
      <div className="p-2 bg-red-50 rounded-lg">
        <p className="text-red-500">Erreur d'affichage de la date</p>
      </div>
    );
  }
};
