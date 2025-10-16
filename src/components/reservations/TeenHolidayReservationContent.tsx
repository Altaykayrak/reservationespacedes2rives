
// src/components/reservations/TeenHolidayReservationContent.tsx
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

// Import our hook dedicated to holiday reservations
import { useExistingHolidayReservations } from "@/hooks/useExistingHolidayReservations";

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
    // REMOVED: isDateAlreadyReserved - no longer provided by useHolidayReservation
    setSelectedDates,
    showSuccessDialog,
    setShowSuccessDialog,
    isSubmitting,
    noSpotsDialog,
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog
  } = useHolidayReservation();

  // Use the dedicated hook to get reservation data including isDateAlreadyReserved
  const {
    isDateAlreadyReserved,
    isLoading: loadingHolidayRes
  } = useExistingHolidayReservations(selectedChild || "");

  const { children: allChildren } = useChildrenData();
  const { filteredChildren } = useCategoryFiltering(
    allChildren,
    selectedPeriod,
    'adolescent'
  );

  // If the reservations are not loaded yet, display a loader
  if (loadingHolidayRes) {
    return (
      <div className="text-center py-8">
        <Loader2 className="animate-spin mx-auto mb-2" />
        Chargement des réservations existantes…
      </div>
    );
  }

  const validDatesCount = selectedDates.filter(
    d => d.date instanceof Date && !isNaN(d.date.getTime())
  ).length;

  const onSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (validDatesCount < 1) {
      setMinimumDaysDialog({ isOpen: true });
      return;
    }
    if (!isSubmitting) handleSubmit();
  };

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
          // Pass the correct isDateAlreadyReserved function from our hook
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
          disabled={!selectedChild || !selectedPeriod || validDatesCount < 1 || isSubmitting}
          type="button"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Réservation en cours...
            </>
          ) : (
            "Confirmer réservation"
          )}
        </Button>
      </div>

      <SuccessReservationDialog 
        open={showSuccessDialog} 
        onOpenChange={setShowSuccessDialog} 
      />
      <NoSpotsDialog
        open={noSpotsDialog.isOpen}
        onOpenChange={open => setNoSpotsDialog({ ...noSpotsDialog, isOpen: open })}
        schoolClass={noSpotsDialog.schoolClass}
        date={noSpotsDialog.date}
      />
      <MinimumDaysDialog
        open={minimumDaysDialog.isOpen}
        onOpenChange={open => setMinimumDaysDialog({ isOpen: open })}
      />
    </div>
  );
};
