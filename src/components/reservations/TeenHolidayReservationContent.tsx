// src/components/reservations/TeenHolidayReservationContent.tsx
import React from "react";
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { PeriodSelector } from "./PeriodSelector";
import { ChildSelector } from "./ChildSelector";
import { HolidayDateSelector } from "./holiday/HolidayDateSelector";
import { SuccessReservationDialog } from "./SuccessReservationDialog";
import { NoSpotsDialog } from "./NoSpotsDialog";
import { MinimumDaysDialog } from "./dialogs/MinimumDaysDialog";
import { Button } from "@/components/ui/button";
import { useChildrenData } from "@/hooks/useChildrenData";
import { useCategoryFiltering } from "@/hooks/useCategoryFiltering";
import { Loader2 } from "lucide-react";
import { useExistingHolidayReservations } from "@/hooks/useExistingHolidayReservations";

export function TeenHolidayReservationContent() {
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
    setSelectedDates,
    showSuccessDialog,
    setShowSuccessDialog,
    isSubmitting,
    noSpotsDialog,
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog,
  } = useHolidayReservation();

  // Récupérer les réservations existantes et la fonction de vérification
  const { isDateAlreadyReserved } = useExistingHolidayReservations(
    selectedChild || ""
  );

  // Filtrer les enfants pour la catégorie "adolescent"
  const { children: allChildren } = useChildrenData();
  const { filteredChildren } = useCategoryFiltering(
    allChildren,
    selectedPeriod,
    "adolescent"
  );

  const validDatesCount = selectedDates.length;

  return (
    <div className="space-y-6">
      {/* Choix de la période */}
      <PeriodSelector
        selectedPeriod={selectedPeriod || ""}
        setSelectedPeriod={setSelectedPeriod}
        holidayPeriods={holidayPeriods}
        filterTeenOnly={true}
      />

      {/* Sélecteur d’enfant */}
      <ChildSelector
        selectedChild={selectedChild || ""}
        setSelectedChild={setSelectedChild}
        children={filteredChildren}
        setSelectedDates={setSelectedDates}
      />

      {/* Sélecteur de dates */}
      {selectedPeriod && selectedChild && (
        <HolidayDateSelector
          selectedDates={selectedDates}
          handleDateToggle={handleDateToggle}
          handleOptionChange={handleOptionChange}
          isDateAlreadyReserved={isDateAlreadyReserved}
          periodId={selectedPeriod}
          selectedChild={selectedChild}
          setSelectedDates={setSelectedDates}
          isTeenPage={true}
        />
      )}

      {/* Bouton de soumission */}
      <div className="flex justify-end mt-6">
        <Button
          onClick={(e) => {
            e.preventDefault();
            if (validDatesCount < 3) {
              setMinimumDaysDialog({ isOpen: true });
              return;
            }
            if (!isSubmitting) handleSubmit();
          }}
          className="w-full md:w-auto"
          disabled={
            !selectedChild ||
            !selectedPeriod ||
            validDatesCount < 3 ||
            isSubmitting
          }
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

      {/* Dialogues */}
      <SuccessReservationDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
      />
      <NoSpotsDialog
        open={noSpotsDialog.isOpen}
        onOpenChange={(open) =>
          setNoSpotsDialog({ ...noSpotsDialog, isOpen: open })
        }
        schoolClass={noSpotsDialog.schoolClass}
        date={noSpotsDialog.date}
      />
      <MinimumDaysDialog
        open={minimumDaysDialog.isOpen}
        onOpenChange={(open) => setMinimumDaysDialog({ isOpen: open })}
      />
    </div>
  );
}
