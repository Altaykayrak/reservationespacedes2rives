
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateItem } from "./DateItem";
import { useHolidayPeriodContext } from "./HolidayPeriodContext";
import { format } from "date-fns";
import { HolidaySpotsBadge } from "@/components/reservations/HolidaySpotsBadge";
import { useHolidaySpots } from "@/hooks/useHolidaySpots";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface WorkdayDateSelectorProps {
  selectedDates: DateOption[];
  handleDateToggle: (date: Date) => void;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  isDateAlreadyReserved: (date: Date) => boolean;
  periodId: string;
}

export const WorkdayDateSelector = ({
  selectedDates,
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved,
  periodId
}: WorkdayDateSelectorProps) => {
  const { holidayPeriod, childInfo } = useHolidayPeriodContext();

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

  // Create a map to store spots data for each date using the useHolidaySpots hook
  const spotsDataMap = new Map<string, { availableSpots: number | null; isFull: boolean; isLoading: boolean }>();
  
  // Use the useHolidaySpots hook for each date
  periodDates.forEach(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Call useHolidaySpots hook for each date
    const { availableSpots, isFull, isLoading } = useHolidaySpots(
      periodId, 
      date, 
      childInfo?.school_class || ""
    );
    
    spotsDataMap.set(dateStr, { availableSpots, isFull, isLoading });
  });

  console.log("🎯 Données spots dans WorkdayDateSelector depuis useHolidaySpots:", Object.fromEntries(spotsDataMap));

  return (
    <ScrollArea className="h-[300px] pr-3">
      <div className="space-y-1">
        {periodDates.map(date => {
          
          const dateStr = format(new Date(date), 'yyyy-MM-dd');
          const selectedDate = selectedDatesMap.get(dateStr) as DateOption | undefined;
          const isSelected = !!selectedDate;
          const isReserved = isDateAlreadyReserved(date);
          
          // Get spots data from the map
          const spotsData = spotsDataMap.get(dateStr);
          const availableSpots = spotsData?.availableSpots ?? null;
          const isDateFull = typeof availableSpots === 'number' && availableSpots <= 0;
          
          console.log(`📅 Date ${dateStr}: spots=${availableSpots}, isFull=${isDateFull}, isReserved=${isReserved}, isLoading=${spotsData?.isLoading}`);
          
          return (
            <div
              key={dateStr}
              className="flex items-center justify-between px-2 py-1 hover:bg-gray-50 rounded"
            >
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
                isTeenClass={false}
                periodId={periodId}
                childSchoolClass={childInfo?.school_class || ""}
                isDisabled={isDateFull && !isReserved} // Désactiver la date si elle est complète et pas déjà réservée
              />
              <HolidaySpotsBadge
                periodId={periodId}
                date={dateStr}
                childSchoolClass={childInfo?.school_class || ""}
              />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
