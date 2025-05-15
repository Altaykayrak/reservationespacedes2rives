
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateItem } from "./DateItem";
import { useHolidayPeriodContext } from "./HolidayPeriodContext";
import { format } from "date-fns";
import HolidaySpotsBadge from "@/components/reservations/HolidaySpotsBadge";

interface WorkdayDateSelectorProps {
  selectedDates: {
    date: Date;
    withoutMeal: boolean;
    earlyDropoff: boolean;
  }[];
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

  // Générer les dates de la période
  const generateDatesForPeriod = () => {
    if (!holidayPeriod) return [];
    
    try {
      // S'assurer que start_date et end_date sont des dates valides
      let startDate: Date;
      let endDate: Date;
      
      try {
        startDate = new Date(holidayPeriod.start_date);
        if (isNaN(startDate.getTime())) {
          console.error("Start date invalide:", holidayPeriod.start_date);
          return [];
        }
      } catch (err) {
        console.error("Erreur lors du parsing de la start_date:", err);
        return [];
      }
      
      try {
        endDate = new Date(holidayPeriod.end_date);
        if (isNaN(endDate.getTime())) {
          console.error("End date invalide:", holidayPeriod.end_date);
          return [];
        }
      } catch (err) {
        console.error("Erreur lors du parsing de la end_date:", err);
        return [];
      }
      
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
    } catch (error) {
      console.error("Erreur lors de la génération des dates:", error);
      return [];
    }
  };

  // Obtenir toutes les dates de la période
  const periodDates = generateDatesForPeriod();

  // Convertir les selectedDates en format lisible pour la comparaison
  const selectedDatesMap = new Map(
    selectedDates.map(d => {
      // Vérifier que d.date est une instance valide de Date
      if (!(d.date instanceof Date) || isNaN(d.date.getTime())) {
        console.error("Date invalide détectée dans selectedDates:", d.date);
        return ["invalid-date", d];
      }
      const dateStr = format(new Date(d.date), 'yyyy-MM-dd');
      return [dateStr, d];
    })
  );

  return (
    <ScrollArea className="h-[300px] pr-3">
      <div className="space-y-1">
        {periodDates.map(date => {
          if (!(date instanceof Date) || isNaN(date.getTime())) {
            console.error("Date invalide détectée dans periodDates:", date);
            return null;
          }
          
          const dateStr = format(new Date(date), 'yyyy-MM-dd');
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
