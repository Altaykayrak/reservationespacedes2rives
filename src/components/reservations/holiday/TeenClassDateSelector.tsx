
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DateItem } from "./DateItem";
import { useHolidayPeriodContext } from "./HolidayPeriodContext";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

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

  // Générer les dates de la période
  const generateDatesForPeriod = () => {
    if (!holidayPeriod) return [];
    
    const startDate = parseISO(holidayPeriod.start_date);
    const endDate = parseISO(holidayPeriod.end_date);
    
    const dateArray = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // On ignore les samedis (6) et dimanches (0)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        dateArray.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dateArray;
  };

  // Obtenir toutes les dates de la période
  const periodDates = generateDatesForPeriod();

  // Convertir les selectedDates en format lisible pour la comparaison
  const selectedDatesMap = new Map(
    selectedDates.map(d => [format(d.date, 'yyyy-MM-dd'), d])
  );

  console.log("TeenClassDateSelector - Period dates:", periodDates);
  console.log("TeenClassDateSelector - Selected dates:", selectedDates);

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription className="text-blue-600">
          Pour les adolescents, sélectionnez au moins 3 jours par semaine. L'option "Sans repas" est activée par défaut.
        </AlertDescription>
      </Alert>
      <ScrollArea className="h-[300px] pr-3">
        <div className="space-y-1">
          {periodDates.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const selectedDate = selectedDatesMap.get(dateStr);
            const isSelected = !!selectedDate;
            
            return (
              <DateItem
                key={dateStr}
                date={date}
                isSelected={isSelected}
                isReserved={isDateAlreadyReserved(date)}
                withoutMeal={selectedDate?.withoutMeal || false}
                earlyDropoff={selectedDate?.earlyDropoff || false}
                onDateToggle={() => handleDateToggle(date)}
                onOptionChange={(option, value) => handleOptionChange(date, option, value)}
                isTeenClass={true}
                periodId={periodId}
                childSchoolClass={childInfo?.school_class || ''}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
