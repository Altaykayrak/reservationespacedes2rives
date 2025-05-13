
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { ChildSelector } from "./ChildSelector";
import { PeriodSelector } from "./PeriodSelector";
import { HolidayDateSelector } from "./holiday/HolidayDateSelector";
import { SuccessReservationDialog } from "./SuccessReservationDialog";
import { NoSpotsDialog } from "./NoSpotsDialog";
import { MinimumDaysDialog } from "./dialogs/MinimumDaysDialog";
import { Tables } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { eventBus } from "@/lib/utils";

interface HolidayReservationContentProps {
  filteredChildren?: Tables<"children">[] | null;
  filterTeenPeriods?: boolean;
}

export const HolidayReservationContent = ({ filteredChildren, filterTeenPeriods = false }: HolidayReservationContentProps) => {
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Utiliser les enfants filtrés si fournis, sinon utiliser les enfants du hook
  const childrenToDisplay = filteredChildren || children;
  
  // Synchroniser l'URL avec l'état de période sélectionnée sans recharger la page
  useEffect(() => {
    const periodIdFromUrl = searchParams.get("periodId");
    
    // Si l'URL a un periodId et qu'il est différent de l'état actuel, mettre à jour l'état
    if (periodIdFromUrl && periodIdFromUrl !== selectedPeriod) {
      setSelectedPeriod(periodIdFromUrl);
    } 
    // Si l'état a un periodId et qu'il est différent de l'URL, mettre à jour l'URL
    else if (selectedPeriod && periodIdFromUrl !== selectedPeriod) {
      searchParams.set("periodId", selectedPeriod);
      setSearchParams(searchParams, { replace: true });
    }
  }, [selectedPeriod, searchParams, setSearchParams, setSelectedPeriod]);
  
  // Fonction pour éviter les doubles clics avec prévention de la propagation d'événement
  const onSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prévenir toute propagation d'événement qui pourrait causer des déclenchements multiples
    e.preventDefault();
    e.stopPropagation();
    
    console.log("DEBUG: Bouton Confirmer réservation cliqué - timestamp:", Date.now());
    console.log(`DEBUG: Nombre de dates sélectionnées: ${selectedDates.length}`);
    
    if (!isSubmitting) {
      console.log("DEBUG: Soumission démarrée - isSubmitting:", isSubmitting);
      handleSubmit();
    } else {
      console.log("DEBUG: Soumission déjà en cours (isSubmitting = true), clic ignoré");
    }
  };

  // Subscribe to reservation events
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('holiday-reservation-created', () => {
      console.log("HolidayReservationContent: Received holiday-reservation-created event");
      // Force a re-render
      setForceUpdate(prev => prev + 1);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Add a state to force re-renders
  const [forceUpdate, setForceUpdate] = useState(0);
  
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <ChildSelector
          selectedChild={selectedChild}
          setSelectedChild={setSelectedChild}
          children={childrenToDisplay}
          setSelectedDates={setSelectedDates}
          onCM2SummerPeriodCheck={setIsCM2SummerPeriod}
        />

        <PeriodSelector
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          holidayPeriods={holidayPeriods}
          filterTeenOnly={filterTeenPeriods}
          updateUrlWithoutRefresh={true}
        />

        {selectedPeriod && !isCM2SummerPeriod && (
          <HolidayDateSelector
            key={`holiday-selector-${forceUpdate}-${selectedChild}-${selectedPeriod}`}
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
          disabled={(!selectedChild || !selectedPeriod || (selectedDates.length === 0 && !isCM2SummerPeriod) || isSubmitting)}
          type="button" // Spécifier explicitement le type button pour éviter soumission de formulaire implicite
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
