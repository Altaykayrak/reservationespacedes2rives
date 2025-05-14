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
import { useSchoolClassUtils } from "@/hooks/useSchoolClassUtils";
import { useEffect, useState } from "react";
import { useHolidayPeriods } from "@/hooks/useHolidayPeriods";
import { EmptyHolidayState } from "./holiday/EmptyHolidayState";

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

  const { isTeenClassSync } = useSchoolClassUtils();
  const { holidayPeriods: allHolidayPeriods } = useHolidayPeriods();
  const { children: allChildren } = useChildrenData();
  const [filteredChildrenState, setFilteredChildrenState] = useState<any[]>([]);

  useEffect(() => {
    if (!allChildren) return;

    const filtered = allChildren.filter(child => {
      return isTeenClassSync(child.school_class);
    });

    setFilteredChildrenState(filtered);
  }, [allChildren, isTeenClassSync]);

  // Calculer le nombre exact de jours sélectionnés valides
  const validDates = selectedDates.filter(d => 
    d.date instanceof Date && !isNaN(d.date.getTime())
  );
  const validDatesCount = validDates.length;

  // Vérifier si le nombre de jours sélectionnés est suffisant
  const hasMinimumDays = validDatesCount >= 3;
  
  console.log(`🔍 TeenHolidayContent - Dates sélectionnées total: ${selectedDates.length}`);
  console.log(`🔍 TeenHolidayContent - Dates valides count: ${validDatesCount}`);
  console.log(`🔍 TeenHolidayContent - hasMinimumDays: ${hasMinimumDays}`);

  // Fonction pour éviter les doubles clics
  const onSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Vérifier le nombre exact de dates sélectionnées
    console.log(`🔍 DEBUG: (Teen) Bouton cliqué - Dates sélectionnées total: ${selectedDates.length}`);
    console.log(`🔍 DEBUG: (Teen) Bouton cliqué - Nombre de dates valides: ${validDatesCount}`);
    console.log(`🔍 DEBUG: (Teen) Validation minimale: ${hasMinimumDays} (${validDatesCount} >= 3)`);
    
    if (validDatesCount < 3) {
      console.log("🛑 DEBUG: (Teen) Moins de 3 dates valides, affichage du dialogue");
      setMinimumDaysDialog({ isOpen: true });
      return;
    }
    
    if (!isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <ChildSelector
        selectedChild={selectedChild}
        setSelectedChild={setSelectedChild}
        children={filteredChildrenState}
        setSelectedDates={setSelectedDates}
      />

      <PeriodSelector
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        holidayPeriods={holidayPeriods}
        filterTeenOnly={true}
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
        onOpenChange={(open) => setNoSpotsDialog({ ...noSpotsDialog, isOpen: open })}
        schoolClass={noSpotsDialog.schoolClass}
        date={noSpotsDialog.date}
      />

      <MinimumDaysDialog
        open={minimumDaysDialog.isOpen}
        onOpenChange={(open) => setMinimumDaysDialog({ isOpen: open })}
      />
    </div>
  );
};
