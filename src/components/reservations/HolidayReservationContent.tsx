
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
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { eventBus } from "@/lib/utils";
import { toast } from "sonner";

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
  const [renderKey, setRenderKey] = useState(0);
  const isInitialMount = useRef(true);
  const periodFromUrlApplied = useRef(false);
  const submitAttemptCount = useRef(0);

  // Utiliser les enfants filtrés si fournis, sinon utiliser les enfants du hook
  const childrenToDisplay = filteredChildren || children;
  
  // Log pour déboguer l'état
  useEffect(() => {
    console.log("[HolidayReservationContent] État actuel:", { 
      selectedPeriod,
      selectedChild,
      selectedDatesCount: selectedDates?.length || 0,
      periodFromURL: searchParams.get("periodId")
    });
  }, [selectedPeriod, selectedChild, selectedDates, searchParams]);

  // Synchroniser l'URL avec l'état de période sélectionnée sans recharger la page
  useEffect(() => {
    const periodIdFromUrl = searchParams.get("periodId");
    
    console.log("[HolidayReservationContent] Synchronisation URL <-> état");
    console.log("  - periodIdFromUrl =", periodIdFromUrl);
    console.log("  - selectedPeriod =", selectedPeriod);
    console.log("  - isInitialMount =", isInitialMount.current);
    console.log("  - periodFromUrlApplied =", periodFromUrlApplied.current);
    
    // Au montage initial, si l'URL contient un periodId, l'utiliser
    if (isInitialMount.current && periodIdFromUrl && !periodFromUrlApplied.current) {
      console.log("  - [INIT] Mise à jour de selectedPeriod depuis URL");
      setSelectedPeriod(periodIdFromUrl);
      periodFromUrlApplied.current = true;
      isInitialMount.current = false;
      return;
    }
    
    // Si le selectedPeriod a changé et que ce n'est pas le montage initial, mettre à jour l'URL
    if (!isInitialMount.current && selectedPeriod && periodIdFromUrl !== selectedPeriod) {
      console.log("  - [UPDATE] Mise à jour de l'URL depuis selectedPeriod");
      const newParams = new URLSearchParams(searchParams);
      newParams.set("periodId", selectedPeriod);
      
      // Utiliser requestAnimationFrame pour éviter les problèmes de timing
      window.requestAnimationFrame(() => {
        setSearchParams(newParams, { replace: true });
      });
    }
    
    isInitialMount.current = false;
  }, [selectedPeriod, searchParams, setSearchParams, setSelectedPeriod]);
  
  // Fonction sécurisée pour mettre à jour selectedPeriod
  const handlePeriodChange = useCallback((periodId: string) => {
    console.log("[HolidayReservationContent] handlePeriodChange appelé avec:", periodId);
    setSelectedPeriod(periodId);
    // Forcer un re-rendu du sélecteur de dates
    setRenderKey(prev => prev + 1);
  }, [setSelectedPeriod]);
  
  // Fonction pour éviter les doubles clics avec prévention de la propagation d'événement
  const onSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prévenir toute propagation d'événement qui pourrait causer des déclenchements multiples
    e.preventDefault();
    e.stopPropagation();
    
    // Éviter les soumissions multiples rapprochées
    const now = Date.now();
    submitAttemptCount.current += 1;
    
    console.log(`[HolidayReservationContent] Bouton Confirmer réservation cliqué:`, {
      timestamp: now,
      selectedDates: selectedDates.length,
      attemptCount: submitAttemptCount.current
    });
    
    if (submitAttemptCount.current > 3) {
      toast.warning("Veuillez patienter entre les soumissions");
      setTimeout(() => {
        submitAttemptCount.current = 0;
      }, 2000);
      return;
    }
    
    if (!isSubmitting) {
      console.log("[HolidayReservationContent] Soumission démarrée");
      handleSubmit();
      
      // Reset le compteur après un délai
      setTimeout(() => {
        submitAttemptCount.current = 0;
      }, 2000);
    } else {
      console.log("[HolidayReservationContent] Soumission déjà en cours, clic ignoré");
    }
  };

  // Subscribe to reservation events
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('holiday-reservation-created', () => {
      console.log("[HolidayReservationContent] Received holiday-reservation-created event");
      // Force a re-render
      setRenderKey(prev => prev + 1);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <ChildSelector
          selectedChild={selectedChild}
          setSelectedChild={(childId) => {
            console.log("[HolidayReservationContent] setSelectedChild appelé avec:", childId);
            setSelectedChild(childId);
          }}
          children={childrenToDisplay}
          setSelectedDates={setSelectedDates}
          onCM2SummerPeriodCheck={setIsCM2SummerPeriod}
        />

        <PeriodSelector
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={handlePeriodChange}
          holidayPeriods={holidayPeriods}
          filterTeenOnly={filterTeenPeriods}
          updateUrlWithoutRefresh={true}
        />

        {selectedPeriod && selectedChild && !isCM2SummerPeriod && (
          <HolidayDateSelector
            key={`holiday-selector-${renderKey}-${selectedChild}-${selectedPeriod}`}
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
