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
  const navigate = useNavigate();
  const location = useLocation();
  const initialRender = useRef(true);
  const previousPeriod = useRef(selectedPeriod);
  const urlUpdating = useRef(false);
  const childrenToDisplay = filteredChildren || children;

  // Lire l'ID de période depuis l'URL lors du montage
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const periodId = searchParams.get("periodId");

    if (periodId && periodId !== selectedPeriod) {
      console.log("[HolidayReservationContent] Setting period from URL:", periodId);
      setSelectedPeriod(periodId);
      previousPeriod.current = periodId;
    }
  }, []); // run once on mount

  // Mettre à jour l'URL quand la période change, éviter les rechargements
  const updateUrlWithPeriod = useCallback((newPeriod: string | null) => {
    if (!newPeriod || urlUpdating.current) return;

    urlUpdating.current = true;

    try {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set("periodId", newPeriod);
      const newUrl = `${location.pathname}?${searchParams.toString()}`;
      const currentUrl = `${location.pathname}${location.search}`;

      if (newUrl !== currentUrl) {
        console.log("[HolidayReservationContent] Updating URL with period:", newPeriod);
        navigate(newUrl, { replace: true });
      }
    } catch (error) {
      console.error("[HolidayReservationContent] Error updating URL:", error);
    } finally {
      setTimeout(() => {
        urlUpdating.current = false;
      }, 100);
    }
  }, [navigate, location.pathname, location.search]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    if (selectedPeriod && selectedPeriod !== previousPeriod.current && !urlUpdating.current) {
      previousPeriod.current = selectedPeriod;
      updateUrlWithPeriod(selectedPeriod);
    }
  }, [selectedPeriod, updateUrlWithPeriod]);

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
    {/* ... */}
  </Card>
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
