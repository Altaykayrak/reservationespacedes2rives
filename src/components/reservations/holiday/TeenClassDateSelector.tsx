
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DateItem } from "./DateItem";
import { useHolidayPeriodContext } from "./HolidayPeriodContext";
import { useState, useEffect } from "react";

interface TeenClassDateSelectorProps {
  selectedDates: { date: Date; withoutMeal: boolean; earlyDropoff: boolean }[];
  isDateAlreadyReserved: (date: Date) => boolean;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  periodId: string;
}

export const TeenClassDateSelector: React.FC<TeenClassDateSelectorProps> = ({
  selectedDates,
  isDateAlreadyReserved,
  handleOptionChange,
  periodId
}) => {
  const { holidayPeriod, childInfo, isTeenClass } = useHolidayPeriodContext();
  const [isVisible, setIsVisible] = useState(true);

  // Effet de clignotement au chargement
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 700);

    // Arrêter l'effet après 3 secondes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsVisible(true);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Si ce n'est pas un adolescent ou si c'est la page des réservations normales, on ne devrait pas afficher ce composant
  if (!isTeenClass || !holidayPeriod || window.location.pathname === "/holiday-reservations") return null;

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription 
          className={`font-bold text-red-600 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-30'}`}
        >
          Les adolescents doivent être inscrits pour la semaine complète. La réservation sera automatiquement faite pour tous les jours de la période.
        </AlertDescription>
      </Alert>
      <ScrollArea className="h-[300px] pr-3">
        <div className="space-y-1">
          {selectedDates.map((dateOption) => (
            <DateItem
              key={dateOption.date.toISOString()}
              date={dateOption.date}
              isSelected={true}
              isReserved={isDateAlreadyReserved(dateOption.date)}
              withoutMeal={true}
              earlyDropoff={dateOption.earlyDropoff}
              onDateToggle={() => {}} // Disabled for teens
              onOptionChange={(option, value) => 
                option === 'earlyDropoff' ? handleOptionChange(dateOption.date, option, value) : null
              }
              isTeenClass={true}
              periodId={periodId}
              childSchoolClass={childInfo?.school_class || ''}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
