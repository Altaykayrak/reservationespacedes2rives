
// src/components/reservations/HolidayReservationContent.tsx
import React, { useEffect, useState } from "react";
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
import { useLocation } from "react-router-dom";
import { useCategoryFiltering } from "@/hooks/useCategoryFiltering";
import { Tables } from "@/integrations/supabase/types";

export interface HolidayReservationContentProps {
  filteredChildren?: Tables<"children">[] | null;
  filterTeenPeriods?: boolean;
  invertSelectors?: boolean;
  enforceCM2Summer?: boolean;
}

export const HolidayReservationContent: React.FC<HolidayReservationContentProps> = ({
  filteredChildren,
  filterTeenPeriods = false,
  invertSelectors = false,
  enforceCM2Summer = false,
}) => {
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
    setMinimumDaysDialog,
  } = useHolidayReservation();

  // Ajouter un état pour stocker l'enfant sélectionné et éviter le comportement indésirable
  const [storedChild, setStoredChild] = useState<string | null>(null);

  const { children: allChildren } = useChildrenData();
  const location = useLocation();

  // N'utiliser le filtrage par catégorie que si aucun enfant filtré externe n'est fourni
  const { filteredChildren: categorizedChildren } = useCategoryFiltering(
    filteredChildren ? null : allChildren,  // Ne pas appliquer le filtrage si on a déjà des enfants filtrés
    selectedPeriod,
    filterTeenPeriods ? 'adolescent' : undefined
  );

  // Utiliser les enfants filtrés fournis en props ou le résultat du filtrage par catégorie
  const periodObj = holidayPeriods?.find(p => p.id === selectedPeriod);
  const periodCode = (periodObj as any)?.code || (periodObj as any)?.name || '';
  const earlySummerCodes = ['ETE-01', 'ETE-02', 'ETE-03', 'ETE-04'];
  const isEarlySummer = earlySummerCodes.includes(periodCode);
  
  // Si on a des enfants filtrés en props et qu'on est sur une page Club Ado, conserver tous les CM2
  const baseChildren = filteredChildren || categorizedChildren || [];
  
  // Ne pas filtrer les CM2 en été si enforceCM2Summer est activé
  const childrenToDisplay = baseChildren.filter(child => {
    if (enforceCM2Summer && child.school_class === 'CM2') {
      return true; // Toujours inclure les CM2 si enforceCM2Summer est activé
    }
    // Filtrer uniquement dans le cas non-Club Ado
    return !(isEarlySummer && !filterTeenPeriods && child.school_class === 'CM2');
  });

  // Effet pour stocker l'enfant sélectionné lorsqu'il change
  useEffect(() => {
    if (selectedChild) {
      setStoredChild(selectedChild);
    }
  }, [selectedChild]);

  // Effet pour restaurer l'enfant sélectionné si possible après un changement de période
  useEffect(() => {
    if (storedChild && !selectedChild) {
      // Vérifier si l'enfant stocké est toujours dans la liste actuelle
      const isChildStillAvailable = childrenToDisplay.some(child => child.id === storedChild);
      if (isChildStillAvailable) {
        setSelectedChild(storedChild);
      }
    }
  }, [childrenToDisplay, selectedChild, storedChild, setSelectedChild]);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const periodId = searchParams.get("periodId");
      if (periodId && periodId !== selectedPeriod) {
        setSelectedPeriod(periodId);
      }
    } catch {}
  }, [location.search, selectedPeriod, setSelectedPeriod]);

  const validDatesCount = selectedDates.filter(
    d => d.date instanceof Date && !isNaN(d.date.getTime())
  ).length;

  const onSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (validDatesCount < 3) {
      setMinimumDaysDialog({ isOpen: true });
      return;
    }
    if (!isSubmitting) handleSubmit();
  };

  return (
    <div className="space-y-6">
      {invertSelectors ? (
        <>
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            holidayPeriods={holidayPeriods}
            filterTeenOnly={filterTeenPeriods}
          />
          <ChildSelector
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            children={childrenToDisplay}
            setSelectedDates={setSelectedDates}
          />
        </>
      ) : (
        <>
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
            filterTeenOnly={filterTeenPeriods}
          />
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
          isTeenPage={filterTeenPeriods}
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
            <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Réservation en cours...</>
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
        onOpenChange={open => setNoSpotsDialog({ ...noSpotsDialog, isOpen: open })}
        schoolClass={noSpotsDialog.schoolClass}
        date={noSpotsDialog.date}
      />
      <MinimumDaysDialog
        open={minimumDaysDialog.isOpen}
        onOpenChange={open => setMinimumDaysDialog({ isOpen: open })}
      />
    </div>
  );
};
