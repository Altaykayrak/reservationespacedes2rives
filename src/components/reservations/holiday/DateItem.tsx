
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateOptions } from "./DateOptions";
import { Badge } from "@/components/ui/badge";
import { SpotsBadge } from "./SpotsBadge";
import { useHolidaySpots } from "@/hooks/useHolidaySpots";
import { normalizeSchoolClass } from "@/utils/schoolClassUtils";

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
      isSelected,
      isReserved,
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
    console.log(`Date ${formattedDate} - DISABLED CHECK: isReserved=${isReserved}, spotsLeft=${spotsLeft}, isStrict0=${spotsLeft === 0}`);
    
    // La date doit être désactivée uniquement si elle est déjà réservée OU si spotsLeft est strictement égal à 0
    const isDisabled = isReserved || (typeof spotsLeft === 'number' && spotsLeft === 0);
    
    // Log pour vérifier ce qui bloque éventuellement le clic
    console.log(`Date ${formattedDate} - Final isDisabled=${isDisabled}, isReserved=${isReserved}`);

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!isDisabled) {
        console.log("DateItem - Click handler triggered");
        onDateToggle();
      }
    };

    return (
      <div 
        className={`relative space-y-1 p-2 rounded-lg transition-colors ${
          isReserved ? 'bg-gray-50' : 'bg-blue-50/30 hover:bg-blue-100/30'
        }`}
        onClick={handleClick}
      >
        <div className="flex items-start gap-2">
          <Checkbox
            id={safeDate.toISOString()}
            checked={isSelected}
            onCheckedChange={() => {
              console.log("Checkbox clicked, calling onDateToggle");
              if (!isDisabled) {
                onDateToggle();
              }
            }}
            disabled={isDisabled}
            className={`mt-1 ${isReserved ? 'border-gray-300' : 'border-blue-200'}`}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <Label
                htmlFor={safeDate.toISOString()}
                className={`cursor-pointer font-medium ${
                  isDisabled ? 'text-gray-500' : 'text-blue-900'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (!isDisabled) {
                    console.log("Label clicked, triggering onDateToggle");
                    onDateToggle();
                  }
                }}
              >
                {format(safeDate, "EEEE d MMMM yyyy", { locale: fr })}
              </Label>
              {isReserved && (
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
        {isSelected && !isReserved && (
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
