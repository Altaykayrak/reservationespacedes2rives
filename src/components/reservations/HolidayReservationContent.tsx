import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { ChildSelector } from "./ChildSelector";
import { PeriodSelector } from "./PeriodSelector";
import { DateSelector } from "./DateSelector";

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
      <Card className="p-6">
        <p className="text-center text-gray-500">
          Aucune période de vacances n'est disponible pour le moment.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
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
            <DateSelector
              selectedPeriod={selectedPeriod}
              selectedDates={selectedDates}
              holidayPeriods={holidayPeriods}
              handleDateToggle={handleDateToggle}
              handleOptionChange={handleOptionChange}
              isDateAlreadyReserved={isDateAlreadyReserved}
            />
          )}

          <Button
            onClick={handleSubmit}
            className="w-full"
          >
            Confirmer la réservation
          </Button>
        </div>
      </Card>
    </div>
  );
};