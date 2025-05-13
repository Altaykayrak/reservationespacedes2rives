
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
import { toast } from "@/hooks/use-toast";

interface HolidayReservationContentProps {
  filteredChildren?: Tables<"children">[] | null;
  filterTeenPeriods?: boolean;
  initialPeriodId?: string;
}

export const HolidayReservationContent = ({ 
  filteredChildren, 
  filterTeenPeriods = false,
  initialPeriodId 
}: HolidayReservationContentProps) => {
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
  const initialRenderComplete = useRef(false);
  const urlUpdatePending = useRef(false);
  
  // Utiliser les enfants filtrés si fournis, sinon utiliser les enfants du hook
  const childrenToDisplay = filteredChildren || children;
  
  // Log pour déboguer l'état
  useEffect(() => {
    console.log("[HolidayReservationContent] État actuel:", { 
      selectedPeriod,
      selectedChild,
      selectedDatesCount: selectedDates?.length || 0,
      periodFromURL: searchParams.get("periodId"),
      initialPeriodId,
      holidayPeriodsLength: holidayPeriods?.length || 0
    });
  }, [selectedPeriod, selectedChild, selectedDates, searchParams, initialPeriodId, holidayPeriods]);

  // Initialisation forcée du selectedPeriod si nécessaire
  useEffect(() => {
    if (!initialRenderComplete.current && holidayPeriods && holidayPeriods.length > 0) {
      const periodIdFromUrl = searchParams.get("periodId");
      const validInitialId = initialPeriodId && holidayPeriods.some(p => p.id === initialPeriodId);
      const validUrlId = periodIdFromUrl && holidayPeriods.some(p => p.id === periodIdFromUrl);
      
      console.log("[HolidayReservationContent] Initialisation forcée:", {
        initialRenderComplete: initialRenderComplete.current,
        periodIdFromUrl,
        initialPeriodId,
        validInitialId,
        validUrlId
      });

      // Priorité URL > initialPeriodId > première période
      let idToUse: string;
      
      if (validUrlId) {
        idToUse = periodIdFromUrl as string;
        console.log("[HolidayReservationContent] Utilisation de l'ID depuis l'URL:", idToUse);
      } else if (validInitialId) {
        idToUse = initialPeriodId as string;
        console.log("[HolidayReservationContent] Utilisation de l'initialPeriodId:", idToUse);
      } else {
        idToUse = holidayPeriods[0].id;
        console.log("[HolidayReservationContent] Utilisation de la première période:", idToUse);
      }
      
      // Mettre à jour l'état sans déclencher de cascades de re-renders
      if (idToUse !== selectedPeriod) {
        setSelectedPeriod(idToUse);
      }
      
      // Forcer le renderKey pour refresh du sélecteur
      setRenderKey(prev => prev + 1);
      
      // Mise à jour de l'URL si nécessaire, mais avec une protection contre les boucles
      if (idToUse !== periodIdFromUrl && !urlUpdatePending.current) {
        urlUpdatePending.current = true;
        
        // Utiliser un délai pour éviter les problèmes de timing
        setTimeout(() => {
          const newParams = new URLSearchParams(searchParams);
          newParams.set("periodId", idToUse);
          setSearchParams(newParams, { replace: true });
          urlUpdatePending.current = false;
        }, 50);
      }
      
      initialRenderComplete.current = true;
    }
  }, [holidayPeriods, initialPeriodId, searchParams, setSearchParams, setSelectedPeriod, selectedPeriod]);

  // Synchroniser l'URL avec l'état de période sélectionnée - version améliorée
  useEffect(() => {
    // Ne s'exécute que si le rendu initial est terminé et qu'aucune mise à jour d'URL n'est en cours
    if (!initialRenderComplete.current || urlUpdatePending.current) return;
    
    const periodIdFromUrl = searchParams.get("periodId");
    
    // Si le selectedPeriod a changé et est différent de l'URL, mettre à jour l'URL
    if (selectedPeriod && periodIdFromUrl !== selectedPeriod) {
      console.log("[HolidayReservationContent] Mise à jour de l'URL depuis selectedPeriod:", selectedPeriod);
      
      // Activer le verrou pour empêcher les mises à jour en cascade
      urlUpdatePending.current = true;
      
      // Utiliser setTimeout pour éviter les problèmes de timing
      setTimeout(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("periodId", selectedPeriod);
        setSearchParams(newParams, { replace: true });
        
        // Désactiver le verrou après la mise à jour
        urlUpdatePending.current = false;
      }, 50);
    }
  }, [selectedPeriod, searchParams, setSearchParams]);
  
  // Fonction sécurisée pour mettre à jour selectedPeriod
  const handlePeriodChange = useCallback((periodId: string) => {
    if (periodId === selectedPeriod) return; // Éviter les mises à jour inutiles
    
    console.log("[HolidayReservationContent] handlePeriodChange appelé avec:", periodId);
    setSelectedPeriod(periodId);
    
    // Forcer un re-rendu du sélecteur de dates uniquement si la période change
    setRenderKey(prev => prev + 1);
  }, [setSelectedPeriod, selectedPeriod]);
  
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
  
  // Fonction sécurisée pour mettre à jour l'enfant sélectionné
  const handleChildChange = useCallback((childId: string) => {
    if (childId === selectedChild) return; // Éviter les mises à jour inutiles
    
    console.log("[HolidayReservationContent] setSelectedChild appelé avec:", childId);
    setSelectedChild(childId);
  }, [setSelectedChild, selectedChild]);
  
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <ChildSelector
          selectedChild={selectedChild}
          setSelectedChild={handleChildChange}
          children={childrenToDisplay}
          setSelectedDates={setSelectedDates}
          onCM2SummerPeriodCheck={setIsCM2SummerPeriod}
          selectedPeriodId={selectedPeriod}
        />

        <PeriodSelector
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={handlePeriodChange}
          holidayPeriods={holidayPeriods}
          filterTeenOnly={filterTeenPeriods}
          updateUrlWithoutRefresh={true}
          initialPeriodId={initialPeriodId}
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
