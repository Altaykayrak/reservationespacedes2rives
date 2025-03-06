
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DateItem } from "./DateItem";
import { useHolidayPeriodContext } from "./HolidayPeriodContext";

interface TeenClassDateSelectorProps {
  selectedDates: { date: Date; withoutMeal: boolean; earlyDropoff: boolean }[];
  isDateAlreadyReserved: (date: Date) => boolean;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  handleDateToggle: (date: Date) => void;
  periodId: string;
}

export const TeenClassDateSelector: React.FC<TeenClassDateSelectorProps> = ({
  selectedDates,
  isDateAlreadyReserved,
  handleOptionChange,
  handleDateToggle,
  periodId
}) => {
  const { holidayPeriod, childInfo, isTeenClass } = useHolidayPeriodContext();

  // Si ce n'est pas un adolescent ou si c'est la page des réservations normales, on ne devrait pas afficher ce composant
  if (!isTeenClass || !holidayPeriod || window.location.pathname === "/holiday-reservations") return null;

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription className="text-blue-600">
          Pour les adolescents, sélectionnez au moins 3 jours par semaine. L'option "Sans repas" est activée par défaut.
        </AlertDescription>
      </Alert>
      <ScrollArea className="h-[300px] pr-3">
        <div className="space-y-1">
          {holidayPeriod && Array.isArray(selectedDates) && selectedDates.map((dateOption) => (
            <DateItem
              key={dateOption.date.toISOString()}
              date={dateOption.date}
              isSelected={selectedDates.some(d => d.date.getTime() === dateOption.date.getTime())}
              isReserved={isDateAlreadyReserved(dateOption.date)}
              withoutMeal={dateOption.withoutMeal}
              earlyDropoff={dateOption.earlyDropoff}
              onDateToggle={() => handleDateToggle(dateOption.date)}
              onOptionChange={(option, value) => handleOptionChange(dateOption.date, option, value)}
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
