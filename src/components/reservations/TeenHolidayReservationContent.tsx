
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { ChildSelector } from "./ChildSelector";
import { PeriodSelector } from "./PeriodSelector";
import { TeenClassDateSelector } from "./holiday/TeenClassDateSelector";
import { SuccessReservationDialog } from "./SuccessReservationDialog";
import { NoSpotsDialog } from "./NoSpotsDialog";

export const TeenHolidayReservationContent = () => {
  const {
    selectedDates,
    selectedChild,
    selectedPeriod,
    setSelectedChild,
    setSelectedPeriod,
    children,
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
    setNoSpotsDialog
  } = useHolidayReservation();

  return (
    <>
      <Card className="p-6">
        <div className="space-y-6">
          <ChildSelector
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            children={children}
            setSelectedDates={setSelectedDates}
          />

          <PeriodSelector
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            holidayPeriods={holidayPeriods}
          />

          {selectedPeriod && (
            <TeenClassDateSelector
              selectedDates={selectedDates}
              isDateAlreadyReserved={isDateAlreadyReserved}
              handleOptionChange={handleOptionChange}
              handleDateToggle={handleDateToggle}
              periodId={selectedPeriod}
            />
          )}

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!selectedChild || !selectedPeriod || selectedDates.length === 0 || isSubmitting}
          >
            {isSubmitting ? "Réservation en cours..." : "Confirmer la réservation"}
          </Button>
        </div>
      </Card>

      <SuccessReservationDialog 
        open={showSuccessDialog} 
        onOpenChange={setShowSuccessDialog}
      />

      <NoSpotsDialog
        open={noSpotsDialog.isOpen}
        onOpenChange={(open) => setNoSpotsDialog({ ...noSpotsDialog, isOpen: open })}
        schoolClass={noSpotsDialog.schoolClass}
        date={noSpotsDialog.date}
      />
    </>
  );
};
