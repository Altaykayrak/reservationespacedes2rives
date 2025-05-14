
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
import { useEffect, useState } from "react";
import { useChildrenData } from "@/hooks/useChildrenData";
import { useLocation } from "react-router-dom";
import { useCategoryFiltering } from "@/hooks/useCategoryFiltering";

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
  
  // Si nous n'avons pas d'enfants filtrés fournis, utiliser notre hook de filtrage
  const { filteredChildren: categorizedChildren } = useCategoryFiltering(
    allChildren,
    selectedPeriod,
    filterTeenPeriods ? 'adolescent' : undefined
  );
  
  // Utiliser les enfants filtrés fournis ou ceux générés par notre hook
  const childrenToDisplay = filteredChildren || categorizedChildren;
  
  // Lire l'ID de période depuis l'URL lors du montage (une seule fois)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const periodId = searchParams.get("periodId");

      if (periodId && periodId !== selectedPeriod) {
        console.log("[HolidayReservationContent] Setting period from URL:", periodId);
        setSelectedPeriod(periodId);
      }
    } catch (error) {
      console.error("[HolidayReservationContent] Error reading URL:", error);
    }
  }, [location.search, selectedPeriod, setSelectedPeriod]);

  // Calculer le nombre exact de jours sélectionnés valides
  const validDates = selectedDates.filter(d => 
    d.date instanceof Date && !isNaN(d.date.getTime())
  );
  const validDatesCount = validDates.length;

  // Vérifier si le nombre de jours sélectionnés est suffisant
  const hasMinimumDays = validDatesCount >= 3;
  
  // Fonction pour éviter les doubles clics
  const onSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Vérifier le nombre exact de dates sélectionnées
    console.log(`🔍 DEBUG: Bouton cliqué - Dates sélectionnées total: ${selectedDates.length}`);
    console.log(`🔍 DEBUG: Bouton cliqué - Nombre de dates valides: ${validDatesCount}`);
    console.log(`🔍 DEBUG: Validation minimale: ${hasMinimumDays} (${validDatesCount} >= 3)`);
    
    // Stop si le minimum n'est pas atteint
    if (validDatesCount < 3) {
      console.log("🛑 DEBUG: Moins de 3 dates valides, affichage du dialogue");
      setMinimumDaysDialog({ isOpen: true });
      return;
    }
    
    if (!isSubmitting) {
      handleSubmit();
    }
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
