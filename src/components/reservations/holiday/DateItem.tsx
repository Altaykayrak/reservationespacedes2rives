
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
  // Vérifier si la date est valide
  const isValidDate = date instanceof Date && !isNaN(date.getTime());
  
  // N'utiliser useHolidaySpots que si la date est valide
  const { availableSpots, isFull, isLoading } = isValidDate 
    ? useHolidaySpots(periodId, date, childSchoolClass)
    : { availableSpots: null, isFull: false, isLoading: false };
  
  // Log pour déboguer
  useEffect(() => {
    if (isValidDate) {
      console.log(`DateItem - Places disponibles pour ${date.toISOString()}:`, {
        periodId,
        schoolClass: childSchoolClass,
        availableSpots,
        isFull,
        isLoading
      });
    } else {
      console.error("DateItem - Date invalide reçue:", date);
    }
  }, [date, periodId, childSchoolClass, availableSpots, isFull, isLoading, isValidDate]);

  // Si la date est invalide, ne pas rendre le composant
  if (!isValidDate) {
    return null;
  }

  const dayLabel = format(date, "EEEE d MMMM", { locale: fr });

  // Gestion des clics
  const handleToggle = () => {
    console.log(`🖱️ DateItem - Toggle pour ${date.toISOString()}, état actuel: ${isSelected}`);
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
      data-date={date.toISOString()}
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
          date={date}
        />
      )}
    </Card>
  );
};
