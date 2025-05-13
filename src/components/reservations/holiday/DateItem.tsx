
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateOptions } from "./DateOptions";
import { Badge } from "@/components/ui/badge";
import { SpotsBadge } from "./SpotsBadge";
import { useHolidaySpots } from "@/hooks/useHolidaySpots";
import { normalizeSchoolClass } from "@/utils/schoolClassUtils";
import { useEffect, useState } from "react";

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
  // Local state to track reservation status
  const [localIsReserved, setLocalIsReserved] = useState(isReserved);
  
  // Update local state when prop changes
  useEffect(() => {
    setLocalIsReserved(isReserved);
  }, [isReserved]);
  
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
    
    console.log("DateItem - Props:", { 
      childSchoolClass, 
      periodId, 
      date: date.toISOString(), 
      isTeenClass 
    });
    
    const normalizedClass = normalizeSchoolClass(childSchoolClass);
    
    // S'assurer que la date est une instance de Date
    const safeDate = date;
    const formattedDate = format(safeDate, "yyyy-MM-dd");
    
    // Pour les enfants CM2 pendant les périodes d'été, on force isTeenClass à true
    let effectiveIsTeenClass = isTeenClass;
    
    const { data: spotsLeft, isLoading } = useHolidaySpots(periodId, safeDate, normalizedClass);
    
    console.log(`DateItem - Date: ${formattedDate}, SpotsLeft: ${spotsLeft}, Type: ${typeof spotsLeft}, isTeenClass: ${effectiveIsTeenClass}`);
    
    // Debug renforcé
    console.log(`Date ${formattedDate} - DISABLED CHECK: isReserved=${localIsReserved}, spotsLeft=${spotsLeft}, isStrict0=${spotsLeft === 0}`);
    
    // La date doit être désactivée uniquement si elle est déjà réservée OU si spotsLeft est strictement égal à 0
    const isDisabled = localIsReserved || (typeof spotsLeft === 'number' && spotsLeft === 0);

    return (
      <div 
        className={`relative space-y-1 p-2 rounded-lg transition-colors ${
          localIsReserved ? 'bg-gray-50' : 'bg-blue-50/30 hover:bg-blue-100/30'
        }`}
      >
        <div className="flex items-start gap-2">
          <Checkbox
            id={safeDate.toISOString()}
            checked={isSelected}
            onCheckedChange={onDateToggle}
            disabled={isDisabled}
            className={`mt-1 ${localIsReserved ? 'border-gray-300' : 'border-blue-200'}`}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <Label
                htmlFor={safeDate.toISOString()}
                className={`cursor-pointer font-medium ${
                  isDisabled ? 'text-gray-500' : 'text-blue-900'
                }`}
              >
                {format(safeDate, "EEEE d MMMM yyyy", { locale: fr })}
              </Label>
              {localIsReserved && (
                <Badge variant="outline" className="text-[10px] md:text-xs">
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
        {isSelected && !localIsReserved && (
          <DateOptions
            date={safeDate}
            withoutMeal={withoutMeal}
            earlyDropoff={earlyDropoff}
            onOptionChange={onOptionChange}
            isTeenClass={effectiveIsTeenClass}
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
