
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateItem } from "./DateItem";
import { useHolidayPeriodContext } from "./HolidayPeriodContext";
import { format, isWeekend } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { SpotsBadge } from "./SpotsBadge";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface TeenClassDateSelectorProps {
  selectedDates: DateOption[];
  handleDateToggle: (date: Date) => void;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  isDateAlreadyReserved: (date: Date) => boolean;
  periodId: string;
}

export const TeenClassDateSelector = ({
  selectedDates,
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved,
  periodId
}: TeenClassDateSelectorProps) => {
  const { holidayPeriod, childInfo } = useHolidayPeriodContext();

  // Générer toutes les dates de la période
  const generateDatesForPeriod = () => {
    if (!holidayPeriod) return [];

    try {
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
        // Pour Club Ado, on inclut TOUS les jours, y compris les week-ends
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dateArray;
    } catch (error) {
      console.error("Erreur lors de la génération des dates:", error);
      return [];
    }
  };

  const periodDates = generateDatesForPeriod();

  const selectedDatesMap = new Map(
    selectedDates.map(d => {
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
          const dateStr = format(new Date(date), 'yyyy-MM-dd');
          const selectedDate = selectedDatesMap.get(dateStr) as DateOption | undefined;
          const isSelected = !!selectedDate;
          const isReserved = isDateAlreadyReserved(date);
          const isWeekendDay = isWeekend(date);
          
          return (
            <div
              key={dateStr}
              className={`flex items-center justify-between px-2 py-1 hover:bg-gray-50 rounded ${
                isWeekendDay ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex-1 flex items-center">
                <DateItem
                  date={date}
                  isSelected={isSelected}
                  isReserved={isReserved}
                  withoutMeal={selectedDate?.withoutMeal || false}
                  earlyDropoff={selectedDate?.earlyDropoff || false}
                  onDateToggle={() => handleDateToggle(date)}
                  onOptionChange={(option, value) => 
                    handleOptionChange(date, option, value)
                  }
                  isTeenClass={true}
                  periodId={periodId}
                  childSchoolClass={childInfo?.school_class || ""}
                  isDisabled={false}
                />
                
                {isWeekendDay && (
                  <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-800">
                    Week-end
                  </Badge>
                )}
              </div>
              
              <SpotsBadge
                availableSpots={null}
                isFull={false}
                schoolClass={childInfo?.school_class || ""}
                isLoading={false}
                periodId={periodId}
                date={date}
              />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
