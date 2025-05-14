
import { PeriodSelector } from "../PeriodSelector";
import { ChildSelector } from "../ChildSelector";
import { Tables } from "@/integrations/supabase/types";

interface HolidaySelectorsProps {
  selectedPeriod: string | null;
  setSelectedPeriod: (periodId: string) => void;
  selectedChild: string;
  setSelectedChild: (childId: string) => void;
  holidayPeriods: Array<any>; // Updated to accept any type of period
  filteredChildren: Tables<"children">[] | null;
  setSelectedDates: (dates: any[]) => void;
  filterTeenPeriods: boolean;
  invertSelectors: boolean;
  onCM2SummerPeriodCheck?: (isInSummerPeriod: boolean) => void;
}

export const HolidaySelectors = ({
  selectedPeriod,
  setSelectedPeriod,
  selectedChild,
  setSelectedChild,
  holidayPeriods,
  filteredChildren,
  setSelectedDates,
  filterTeenPeriods,
  invertSelectors,
  onCM2SummerPeriodCheck
}: HolidaySelectorsProps) => {
  const periodSelectorElement = (
    <PeriodSelector
      selectedPeriod={selectedPeriod}
      setSelectedPeriod={setSelectedPeriod}
      holidayPeriods={holidayPeriods}
      filterTeenOnly={filterTeenPeriods}
    />
  );

  const childSelectorElement = (
    <ChildSelector
      selectedChild={selectedChild}
      setSelectedChild={setSelectedChild}
      children={filteredChildren}
      setSelectedDates={setSelectedDates}
      onCM2SummerPeriodCheck={onCM2SummerPeriodCheck}
    />
  );

  return (
    <>
      {invertSelectors ? (
        <>
          {periodSelectorElement}
          {childSelectorElement}
        </>
      ) : (
        <>
          {childSelectorElement}
          {periodSelectorElement}
        </>
      )}
    </>
  );
};
