
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { ChildSelector } from "./ChildSelector";
import { PeriodSelector } from "./PeriodSelector";
import { HolidayDateSelector } from "./HolidayDateSelector";
import { Toaster } from "@/components/ui/toaster";
import { SuccessReservationDialog } from "./SuccessReservationDialog";

export const HolidayReservationContent = () => {
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
    isSubmitting
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
            <HolidayDateSelector
              selectedDates={selectedDates}
              handleDateToggle={handleDateToggle}
              handleOptionChange={handleOptionChange}
              isDateAlreadyReserved={isDateAlreadyReserved}
              periodId={selectedPeriod}
              selectedChild={selectedChild}
              setSelectedDates={setSelectedDates}
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
      
      <Toaster />
    </>
  );
};
