
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { ChildSelector } from "./ChildSelector";
import { PeriodSelector } from "./PeriodSelector";
import { TeenClassDateSelector } from "./holiday/TeenClassDateSelector";
import { SuccessReservationDialog } from "./SuccessReservationDialog";
import { NoSpotsDialog } from "./NoSpotsDialog";
import { MinimumDaysDialog } from "./dialogs/MinimumDaysDialog";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

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
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog
  } = useHolidayReservation();

  const [isCM2SummerPeriod, setIsCM2SummerPeriod] = useState(false);

  // Fonction pour éviter les doubles clics
  const onSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="space-y-6">
          <ChildSelector
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            children={children}
            setSelectedDates={setSelectedDates}
            onCM2SummerPeriodCheck={setIsCM2SummerPeriod}
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
            onClick={onSubmitClick}
            className="w-full"
            disabled={!selectedChild || !selectedPeriod || selectedDates.length === 0 || isSubmitting}
            type="button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Réservation en cours...
              </>
            ) : (
              "Confirmer la réservation"
            )}
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
      
      <MinimumDaysDialog
        open={minimumDaysDialog.isOpen}
        onOpenChange={(open) => setMinimumDaysDialog({ isOpen: open })}
      />
    </>
  );
};
