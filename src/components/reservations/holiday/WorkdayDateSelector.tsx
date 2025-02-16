
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateItem } from "./DateItem";
import { EmptyHolidayState } from "./EmptyHolidayState";
import { useHolidayPeriodContext } from "./HolidayPeriodContext";

interface WorkdayDateSelectorProps {
  selectedDates: { date: Date; withoutMeal: boolean; earlyDropoff: boolean }[];
  handleDateToggle: (date: Date) => void;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  isDateAlreadyReserved: (date: Date) => boolean;
  periodId: string;
}

export const WorkdayDateSelector: React.FC<WorkdayDateSelectorProps> = ({
  selectedDates,
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved,
  periodId
}) => {
  const { holidayPeriod, childInfo } = useHolidayPeriodContext();

  if (!holidayPeriod) {
    return (
      <EmptyHolidayState 
        message="Sélectionnez une période"
        subtitle="Veuillez d'abord sélectionner une période de vacances."
      />
    );
  }

  const dates: Date[] = [];
  const startDate = new Date(holidayPeriod.start_date);
  const endDate = new Date(holidayPeriod.end_date);
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // Créer une nouvelle instance de Date pour chaque jour
      const dateToAdd = new Date(currentDate);
      // Normaliser l'heure pour la comparaison
      dateToAdd.setHours(0, 0, 0, 0);
      dates.push(dateToAdd);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (dates.length === 0) {
    return (
      <EmptyHolidayState 
        message="Aucune date disponible"
        subtitle="Il n'y a pas de dates disponibles pour cette période."
      />
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-3">
      <div className="space-y-1">
        {dates.map((date) => {
          const selectedDateOption = selectedDates.find(
            (d) => {
              const dateToCompare = new Date(d.date);
              dateToCompare.setHours(0, 0, 0, 0);
              return dateToCompare.getTime() === date.getTime();
            }
          );
          
          // Vérifier si la date est déjà réservée
          const isReserved = isDateAlreadyReserved(date);
          console.log("Date:", date.toISOString(), "isReserved:", isReserved);

          return (
            <DateItem
              key={date.toISOString()}
              date={date}
              isSelected={!!selectedDateOption}
              isReserved={isReserved}
              withoutMeal={selectedDateOption?.withoutMeal || false}
              earlyDropoff={selectedDateOption?.earlyDropoff || false}
              onDateToggle={() => handleDateToggle(date)}
              onOptionChange={(option, value) => handleOptionChange(date, option, value)}
              isTeenClass={false}
              periodId={periodId}
              childSchoolClass={childInfo?.school_class || ''}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};
