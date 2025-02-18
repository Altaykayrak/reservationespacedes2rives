
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateItem } from "@/components/reservations/holiday/DateItem";
import { EmptyHolidayState } from "@/components/reservations/holiday/EmptyHolidayState";
import { useHolidayPeriodContext } from "@/components/reservations/holiday/HolidayPeriodContext";

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

  // Validation plus stricte des données requises
  if (!holidayPeriod) {
    return (
      <EmptyHolidayState 
        message="Sélectionnez une période"
        subtitle="Veuillez d'abord sélectionner une période de vacances."
      />
    );
  }

  if (!childInfo?.school_class) {
    return (
      <EmptyHolidayState 
        message="Information manquante"
        subtitle="La classe de l'enfant n'est pas définie correctement."
      />
    );
  }

  // Mapping des classes en format standardisé
  const classMapping: { [key: string]: string } = {
    "PETITE SECTION": "PS",
    "MOYENNE SECTION": "MS",
    "GRANDE SECTION": "GS",
    "SECONDE": "2NDE",
    "PREMIÈRE": "1ÈRE",
    "TERMINALE": "TERM"
  };

  // Standardisation de la classe
  let normalizedClass = childInfo.school_class.trim().toUpperCase();
  normalizedClass = classMapping[normalizedClass] || normalizedClass;

  // Validation des classes autorisées
  const validClasses = [
    "PS", "MS", "GS", 
    "CP", "CE1", "CE2", "CM1", "CM2",
    "6ÈME", "5ÈME", "4ÈME", "3ÈME",
    "2NDE", "1ÈRE", "TERM"
  ];

  if (!validClasses.includes(normalizedClass)) {
    console.error("Classe invalide:", normalizedClass);
    return (
      <EmptyHolidayState 
        message="Classe non reconnue"
        subtitle="La classe spécifiée n'est pas dans la liste des classes valides."
      />
    );
  }

  const dates: Date[] = [];
  const startDate = new Date(holidayPeriod.start_date);
  const endDate = new Date(holidayPeriod.end_date);
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      const dateToAdd = new Date(currentDate);
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
          
          const isReserved = isDateAlreadyReserved(date);

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
              childSchoolClass={normalizedClass}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};
