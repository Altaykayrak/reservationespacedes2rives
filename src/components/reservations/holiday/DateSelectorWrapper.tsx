
import { HolidayDateSelector } from "./HolidayDateSelector";
import { HolidayPeriodProvider } from "./HolidayPeriodContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface DateSelectorWrapperProps {
  selectedPeriod: string;
  selectedChild: string;
  childInfo: { school_class: string } | null;
  holidayPeriod: any;
  selectedDates: DateOption[];
  handleDateToggle: (date: Date) => void;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
  isDateAlreadyReserved: (date: Date) => boolean;
  setSelectedDates: (dates: DateOption[]) => void;
  isCM2SummerPeriod: boolean;
  isTeenClassSync: (schoolClass: string) => boolean;
}

export const DateSelectorWrapper = ({
  selectedPeriod,
  selectedChild,
  childInfo,
  holidayPeriod,
  selectedDates,
  handleDateToggle,
  handleOptionChange,
  isDateAlreadyReserved,
  setSelectedDates,
  isCM2SummerPeriod,
  isTeenClassSync
}: DateSelectorWrapperProps) => {
  if (!selectedPeriod || !selectedChild || !childInfo || !holidayPeriod || isCM2SummerPeriod) {
    return null;
  }

  return (
    <HolidayPeriodProvider 
      holidayPeriod={holidayPeriod} 
      childInfo={childInfo} 
      isTeenClass={isTeenClassSync(childInfo.school_class)}
    >
      <HolidayDateSelector
        selectedDates={selectedDates}
        handleDateToggle={handleDateToggle}
        handleOptionChange={handleOptionChange}
        isDateAlreadyReserved={isDateAlreadyReserved}
        periodId={selectedPeriod}
        selectedChild={selectedChild}
        setSelectedDates={setSelectedDates}
      />
    </HolidayPeriodProvider>
  );
};
