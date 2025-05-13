
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
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

interface HolidayReservationContentProps {
  filteredChildren?: Tables<"children">[] | null;
  filterTeenPeriods?: boolean;
}

export const HolidayReservationContent = ({
  filteredChildren,
  filterTeenPeriods = false
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
  const location = useLocation();
  const initialRender = useRef(true);
  const previousPeriod = useRef(selectedPeriod);
  const urlUpdating = useRef(false);
  const childrenToDisplay = filteredChildren || children;
  const updateBlocked = useRef(false);

  // Lire l'ID de période depuis l'URL lors du montage (une seule fois)
  useEffect(() => {
    if (!initialRender.current) return;
    
    try {
      const searchParams = new URLSearchParams(location.search);
      const periodId = searchParams.get("periodId");

      if (periodId && periodId !== selectedPeriod) {
        console.log("[HolidayReservationContent] Setting period from URL:", periodId);
        setSelectedPeriod(periodId);
        previousPeriod.current = periodId;
      }
    } catch (error) {
      console.error("[HolidayReservationContent] Error reading URL:", error);
    } finally {
      initialRender.current = false;
    }
  }, [location.search, selectedPeriod, setSelectedPeriod]);

  // Mise à jour synchronisée de l'URL (sans rechargement) uniquement quand nécessaire
  useEffect(() => {
    // Éviter les exécutions inutiles et les boucles
    if (initialRender.current || !selectedPeriod || updateBlocked.current || 
        urlUpdating.current || selectedPeriod === previousPeriod.current) {
      return;
    }
    
    // Appliquer les verrous pour éviter les mises à jour en cascade
    urlUpdating.current = true;
    updateBlocked.current = true;
    console.log("[HolidayReservationContent] Period changed in state to:", selectedPeriod);
    
    try {
      // Mise à jour de l'URL sans rechargement de la page
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("periodId", selectedPeriod);
      window.history.replaceState({ path: newUrl.toString() }, "", newUrl.toString());
      console.log("[HolidayReservationContent] URL updated without reload");
    } catch (error) {
      console.error("[HolidayReservationContent] Error updating URL:", error);
    } finally {
      previousPeriod.current = selectedPeriod;
      
      // Débloquer après un délai pour éviter les effets de rebond
      setTimeout(() => {
        urlUpdating.current = false;
        updateBlocked.current = false;
      }, 200);
    }
  }, [selectedPeriod]);

  const onSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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

        {selectedChild && selectedPeriod && (
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
            disabled={!selectedChild || !selectedPeriod || selectedDates.length === 0 || isSubmitting}
            className="w-full md:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Traitement en cours...
              </>
            ) : (
              "Confirmer réservation"
            )}
          </Button>
        </div>
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
