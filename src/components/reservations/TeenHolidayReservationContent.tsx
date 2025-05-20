
import { Button } from "@/components/ui/button";
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { ChildSelector } from "./ChildSelector";
import { PeriodSelector } from "./PeriodSelector";
import { HolidayDateSelector } from "./holiday/HolidayDateSelector";
import { SuccessReservationDialog } from "./SuccessReservationDialog";
import { NoSpotsDialog } from "./NoSpotsDialog";
import { MinimumDaysDialog } from "./dialogs/MinimumDaysDialog";
import { Loader2 } from "lucide-react";
import { useChildrenData } from "@/hooks/useChildrenData";
import { useCategoryFiltering } from "@/hooks/useCategoryFiltering";

export const TeenHolidayReservationContent = () => {
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
  const { filteredChildren } = useCategoryFiltering(
    allChildren,
    selectedPeriod,
    'adolescent'
  );

  const validDatesCount = selectedDates.filter(d => d.date instanceof Date && !isNaN(d.date.getTime())).length;

  const onSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (validDatesCount < 3) {
      setMinimumDaysDialog({ isOpen: true });
      return;
    }
    if (!isSubmitting) handleSubmit();
  };
console.log("🔍 isDateAlreadyReserved vaut :", isDateAlreadyReserved);
console.log("🔍 type de isDateAlreadyReserved :", typeof isDateAlreadyReserved);
  return (
    <div className="space-y-6">
      <PeriodSelector
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        holidayPeriods={holidayPeriods}
        filterTeenOnly={true}
      />

      <ChildSelector
        selectedChild={selectedChild}
        setSelectedChild={setSelectedChild}
        children={filteredChildren}
        setSelectedDates={setSelectedDates}
      />

      {selectedPeriod && selectedChild && (
        <HolidayDateSelector
          selectedDates={selectedDates}
          handleDateToggle={handleDateToggle}
          handleOptionChange={handleOptionChange}
          isDateAlreadyReserved={isDateAlreadyReserved}
          periodId={selectedPeriod}
          selectedChild={selectedChild}
          setSelectedDates={setSelectedDates}
          isTeenPage={true}
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
