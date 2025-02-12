
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReservations } from "@/hooks/useReservations";
import { ChildSelector } from "./ChildSelector";
import { WednesdayDateSelector } from "./WednesdayDateSelector";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const WednesdayReservationContent = () => {
  const {
    selectedDates,
    selectedChild,
    setSelectedChild,
    children,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    isDateReservedForChild
  } = useReservations();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <ChildSelector
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            children={children}
          />

          <WednesdayDateSelector
            selectedDates={selectedDates}
            handleDateToggle={handleDateToggle}
            handleOptionChange={handleOptionChange}
            isDateAlreadyReserved={(date) => isDateReservedForChild(selectedChild, date)}
          />

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!selectedChild || selectedDates.length === 0}
          >
            Confirmer la réservation
          </Button>
        </div>
      </Card>
    </div>
  );
};
