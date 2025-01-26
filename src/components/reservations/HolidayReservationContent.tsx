import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { ChildSelector } from "./ChildSelector";
import { PeriodSelector } from "./PeriodSelector";
import { HolidayDateSelector } from "./HolidayDateSelector";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const HolidayReservationContent = () => {
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
    isDateAlreadyReserved
  } = useHolidayReservation();

  if (!holidayPeriods || holidayPeriods.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-center text-gray-500">
          Aucune période de vacances n'est disponible pour le moment.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-3">
          <ChildSelector
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            children={children}
          />

          <PeriodSelector
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            holidayPeriods={holidayPeriods}
          />

          {selectedPeriod && (
            <HolidayDateSelector
              selectedDates={selectedDates}
              handleDateToggle={handleDateToggle}
              handleOptionChange={handleOptionChange}
              isDateAlreadyReserved={isDateAlreadyReserved}
              periodId={selectedPeriod}
            />
          )}

          <Button
            onClick={handleSubmit}
            className="w-full mt-2"
            disabled={!selectedChild || !selectedPeriod || selectedDates.length === 0}
          >
            Confirmer la réservation
          </Button>
        </div>
      </Card>
    </div>
  );
};