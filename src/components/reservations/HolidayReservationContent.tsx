
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
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
  const navigate = useNavigate();
  const location = useLocation();
  const initialRender = useRef(true);
  const previousPeriod = useRef(selectedPeriod);
  const urlUpdating = useRef(false);
  const childrenToDisplay = filteredChildren || children;
  
  // Lire l'ID de période depuis l'URL lors du montage du composant uniquement
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const periodId = searchParams.get("periodId");
    
    // Seulement si l'ID de période existe dans l'URL et est différent de la période sélectionnée
    if (periodId && periodId !== selectedPeriod) {
      console.log("[HolidayReservationContent] Setting period from URL:", periodId);
      setSelectedPeriod(periodId);
      previousPeriod.current = periodId;
    }
  }, []); // Dépendance vide pour exécuter uniquement au montage
  
  // Mettre à jour l'URL lorsque la période change, mais uniquement après le rendu initial
  const updateUrlWithPeriod = useCallback((newPeriod: string | null) => {
    if (!newPeriod || urlUpdating.current) return;
    
    urlUpdating.current = true;
    
    try {
      console.log("[HolidayReservationContent] Updating URL with period:", newPeriod);
      const searchParams = new URLSearchParams(location.search);
      searchParams.set("periodId", newPeriod);
      navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
    } catch (error) {
      console.error("[HolidayReservationContent] Error updating URL:", error);
    } finally {
      // Reset après un court délai pour permettre de futures mises à jour
      setTimeout(() => {
        urlUpdating.current = false;
      }, 100);
    }
  }, [navigate, location.pathname, location.search]);
  
  useEffect(() => {
    // Ignorer le premier rendu pour éviter les boucles
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    // Uniquement mettre à jour l'URL si la période a réellement changé
    if (selectedPeriod && selectedPeriod !== previousPeriod.current && !urlUpdating.current) {
      previousPeriod.current = selectedPeriod;
      updateUrlWithPeriod(selectedPeriod);
    }
  }, [selectedPeriod, updateUrlWithPeriod]);
  
  // Fonction pour éviter les double-clics avec prévention de la propagation d'événements
  const onSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Empêcher toute propagation d'événement qui pourrait provoquer plusieurs déclenchements
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
        />

        {selectedPeriod && !isCM2SummerPeriod && (
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
          disabled={(!selectedChild || !selectedPeriod || (selectedDates.length === 0 && !isCM2SummerPeriod) || isSubmitting)}
          type="button" // Spécifier explicitement le type de bouton pour éviter la soumission implicite du formulaire
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
