// src/components/reservations/HolidayReservationContent.tsx
import { Button } from "@/components/ui/button";
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { ChildSelector } from "./ChildSelector";
import { PeriodSelector } from "./PeriodSelector";
import { HolidayDateSelector } from "./HolidayDateSelector";
import { SuccessReservationDialog } from "./SuccessReservationDialog";
import { NoSpotsDialog } from "./NoSpotsDialog";
import { MinimumDaysDialog } from "./dialogs/MinimumDaysDialog";
import { Loader2 } from "lucide-react";
import { useChildrenData } from "@/hooks/useChildrenData";
import { useLocation } from "react-router-dom";
import { useCategoryFiltering } from "@/hooks/useCategoryFiltering";
import { Tables } from "@/integrations/supabase/types";

interface HolidayReservationContentProps {
  filteredChildren?: Tables<"children">[] | null;
  filterTeenPeriods?: boolean;
  invertSelectors?: boolean;
}

export const HolidayReservationContent = ({
  filteredChildren,
  filterTeenPeriods = false,
  invertSelectors = false
}: HolidayReservationContentProps) => {
  const {
    selectedDates,
    selectedChild,
    selectedPeriod,
    setSelectedChild,
    setSelectedPeriod,
    holidayPeriods,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    isDateAlreadyReserved,
    setSelectedDates,
    showSuccessDialog,
    setShowSuccessDialog,
    isSubmitting,
    noSpotsDialog,
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog
  } = useHolidayReservation();

  const { children: allChildren } = useChildrenData();
  const location = useLocation();
  const { filteredChildren: categorizedChildren } = useCategoryFiltering(
    allChildren,
    selectedPeriod,
    filterTeenPeriods ? 'adolescent' : undefined
  );
  const childrenToDisplay = filteredChildren || categorizedChildren;

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const periodId = searchParams.get("periodId");
      if (periodId && periodId !== selectedPeriod) {
        setSelectedPeriod(periodId);
      }
    } catch {}
  }, [location.search, selectedPeriod, setSelectedPeriod]);

  const validDates = selectedDates.filter(d => d.date instanceof Date && !isNaN(d.date.getTime()));
  const validDatesCount = validDates.length;
  const hasMinimumDays = validDatesCount >= 3;

  const onSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (validDatesCount < 3) {
      setMinimumDaysDialog({ isOpen: true });
      return;
    }
    if (!isSubmitting) handleSubmit();
  };

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
      children={childrenToDisplay}
      setSelectedDates={setSelectedDates}
    />
  );

  return (
    <div className="space-y-6">
      {invertSelectors ? (
        <>{periodSelectorElement}{childSelectorElement}</>
      ) : (
        <>{childSelectorElement}{periodSelectorElement}</>
      )}

      {selectedPeriod && selectedChild && (
        <HolidayDateSelector
          selectedDates={selectedDates}
          handleDateToggle={handleDateToggle}
          handleOptionChange={handleOptionChange}
          isDateAlreadyReserved={isDateAlreadyReserved}
          periodId={selectedPeriod}
          selectedChild={selectedChild}
          setSelectedDates={setSelectedDates}
          isTeenPage={false}
        />
      )}

      <div className="flex justify-end mt-6">
        <Button
          onClick={onSubmitClick}
          className="w-full md:w-auto"
          disabled={!selectedChild || !selectedPeriod || validDatesCount < 3 || isSubmitting}
          type="button"
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Réservation en cours...</>
          ) : (
            "Confirmer réservation"
          )}
        </Button>
      </div>

      <SuccessReservationDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog} />
      <NoSpotsDialog open={noSpotsDialog.isOpen} onOpenChange={open => setNoSpotsDialog({ ...noSpotsDialog, isOpen: open })} schoolClass={noSpotsDialog.schoolClass} date={noSpotsDialog.date} />
      <MinimumDaysDialog open={minimumDaysDialog.isOpen} onOpenChange={open => setMinimumDaysDialog({ isOpen: open })} />
    </div>
  );
};