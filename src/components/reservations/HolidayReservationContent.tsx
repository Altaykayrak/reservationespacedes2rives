
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { ChildSelector } from "./ChildSelector";
import { PeriodSelector } from "./PeriodSelector";
import { HolidayDateSelector } from "./HolidayDateSelector";
import { SuccessReservationDialog } from "./SuccessReservationDialog";
import { NoSpotsDialog } from "./NoSpotsDialog";
import { MinimumDaysDialog } from "./dialogs/MinimumDaysDialog";
import { Tables } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

interface HolidayReservationContentProps {
  filteredChildren?: Tables<"children">[] | null;
}

export const HolidayReservationContent = ({ filteredChildren }: HolidayReservationContentProps) => {
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

  // Use the filtered children if provided, otherwise use the children from the hook
  const childrenToDisplay = filteredChildren || children;
  
  // Fonction pour éviter les doubles clics avec logging amélioré
  const onSubmitClick = () => {
    console.log("DEBUG: Bouton Confirmer réservation cliqué");
    if (!isSubmitting) {
      console.log("DEBUG: Soumission démarrée - isSubmitting:", isSubmitting);
      handleSubmit();
    } else {
      console.log("DEBUG: Soumission déjà en cours (isSubmitting = true), clic ignoré");
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <ChildSelector
          selectedChild={selectedChild}
          setSelectedChild={setSelectedChild}
          children={childrenToDisplay}
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
          onClick={onSubmitClick}
          className="w-full"
          disabled={!selectedChild || !selectedPeriod || selectedDates.length === 0 || isSubmitting}
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
    </Card>
  );
};
