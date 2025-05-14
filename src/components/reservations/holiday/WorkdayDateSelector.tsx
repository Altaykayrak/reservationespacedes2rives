
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

  const rawClass = childInfo.school_class.trim();
  
  // Si la classe est déjà dans le format attendu, on la garde telle quelle
  const validClasses = [
    "PS", "MS", "GS", 
    "CP", "CE1", "CE2", "CM1", "CM2",
    "6ème", "5ème", "4ème", "3ème",
    "Seconde", "Première", "Terminale"
  ];

  if (validClasses.includes(rawClass)) {
    console.log("Classe déjà dans le bon format:", rawClass);
    return renderContent(rawClass);
  }

  // Sinon on essaie de la normaliser
  const classMapping: { [key: string]: string } = {
    "PETITE SECTION": "PS",
    "MOYENNE SECTION": "MS",
    "GRANDE SECTION": "GS",
    "SECONDE": "Seconde",
    "PREMIÈRE": "Première",
    "TERMINALE": "Terminale",
    "6EME": "6ème",
    "5EME": "5ème",
    "4EME": "4ème",
    "3EME": "3ème"
  };

  const normalizedClass = classMapping[rawClass.toUpperCase()];
  
  if (!normalizedClass) {
    console.error("Classe non reconnue:", rawClass);
    return (
      <EmptyHolidayState 
        message="Classe non reconnue"
        subtitle="La classe spécifiée n'est pas dans la liste des classes valides."
      />
    );
  }

  return renderContent(normalizedClass);

  function renderContent(schoolClass: string) {
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

    // Vérifier si des dates sont sélectionnées et log pour debug
    console.log("WorkdayDateSelector - Dates disponibles:", dates.length);
    console.log("WorkdayDateSelector - Dates sélectionnées:", selectedDates.length);

    return (
      <ScrollArea className="h-[300px] pr-3">
        <div className="space-y-1">
          {dates.map((date) => {
            // Normaliser la date pour la comparaison
            const dateOnly = new Date(date);
            dateOnly.setHours(0, 0, 0, 0);
            
            const selectedDateOption = selectedDates.find(
              (d) => {
                if (!(d.date instanceof Date)) return false;
                
                const dDateOnly = new Date(d.date);
                dDateOnly.setHours(0, 0, 0, 0);
                
                return dDateOnly.getTime() === dateOnly.getTime();
              }
            );
            
            const isReserved = isDateAlreadyReserved(date);
            
            console.log(`Date ${date.toISOString()} - isReserved: ${isReserved}, selectedOption:`, selectedDateOption);

            return (
              <DateItem
                key={date.toISOString()}
                date={date}
                isSelected={!!selectedDateOption}
                isReserved={isReserved}
                withoutMeal={selectedDateOption?.withoutMeal || false}
                earlyDropoff={selectedDateOption?.earlyDropoff || false}
                onDateToggle={() => {
                  console.log(`WorkdayDateSelector - Toggle date appelé pour: ${date.toISOString()}`);
                  handleDateToggle(date);
                }}
                onOptionChange={(option, value) => {
                  console.log(`WorkdayDateSelector - Option change pour: ${date.toISOString()}`, option, value);
                  handleOptionChange(date, option, value);
                }}
                isTeenClass={false}
                periodId={periodId}
                childSchoolClass={schoolClass}
              />
            );
          })}
        </div>
      </ScrollArea>
    );
  }
};
