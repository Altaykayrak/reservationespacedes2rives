
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateOptions } from "./DateOptions";
import { useHolidaySpots } from "@/hooks/useHolidaySpots";
import { SpotsBadge } from "./SpotsBadge";
import { useState, useEffect } from "react";

interface DateItemProps {
  date: Date;
  isSelected: boolean;
  isReserved: boolean;
  withoutMeal: boolean;
  earlyDropoff: boolean;
  onDateToggle: () => void;
  onOptionChange: (option: "withoutMeal" | "earlyDropoff", value: boolean) => void;
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
  childSchoolClass,
}: DateItemProps) => {
  const [localDate, setLocalDate] = useState<Date | null>(null);
  
  // Ensure valid date first
  useEffect(() => {
    try {
      // Tester si la date est valide
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error("🛑 DateItem - Date invalide reçue:", date);
        // Tentative de correction
        const correctedDate = date instanceof Date ? date : new Date(date);
        if (correctedDate instanceof Date && !isNaN(correctedDate.getTime())) {
          console.log("✅ DateItem - Date corrigée:", correctedDate);
          setLocalDate(correctedDate);
        } else {
          console.error("❌ DateItem - Impossible de corriger la date");
          setLocalDate(null);
        }
      } else {
        setLocalDate(date);
      }
    } catch (error) {
      console.error("❌ DateItem - Erreur lors du traitement de la date:", error);
      setLocalDate(null);
    }
  }, [date]);

  // Hook pour vérifier les places disponibles - s'assurer qu'il est appelé même si la date est invalide
  const { availableSpots, isFull, isLoading } = useHolidaySpots(
    periodId, 
    localDate || new Date(), // Fournir une valeur par défaut pour éviter les erreurs
    childSchoolClass
  );

  // Log détaillé pour déboguer les places disponibles
  useEffect(() => {
    console.log(`DateItem - Places disponibles pour ${localDate?.toISOString()}:`, {
      periodId,
      schoolClass: childSchoolClass,
      availableSpots,
      isFull,
      isLoading
    });
  }, [localDate, periodId, childSchoolClass, availableSpots, isFull, isLoading]);

  // If the date is invalid and impossible to correct, don't render
  if (!localDate) {
    console.error("❌ DateItem - Date invalide, composant non rendu");
    return null;
  }

  const dayLabel = format(localDate, "EEEE d MMMM", { locale: fr });

  // Gestion des clics
  const handleToggle = () => {
    console.log(`🖱️ DateItem - Toggle pour ${localDate.toISOString()}, état actuel: ${isSelected}`);
    if (!isReserved && !isFull) {
      onDateToggle();
    }
  };

  return (
    <Card
      className={`w-full p-3 border-muted-foreground ${
        isSelected ? "border-2 border-primary" : "border"
      } ${isReserved ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={handleToggle}
      data-date={localDate.toISOString()}
    >
      <div className="flex items-center justify-between">
        <Label className="font-semibold">{dayLabel}</Label>
        {isReserved ? (
          <span className="text-red-500 font-semibold">Réservé</span>
        ) : (
          <SpotsBadge 
            availableSpots={availableSpots} 
            isFull={isFull} 
            schoolClass={childSchoolClass}
            isLoading={isLoading}
          />
        )}
      </div>
      {!isReserved && !isTeenClass && (
        <DateOptions
          withoutMeal={withoutMeal}
          earlyDropoff={earlyDropoff}
          onOptionChange={onOptionChange}
          date={localDate}
        />
      )}
    </Card>
  );
};
