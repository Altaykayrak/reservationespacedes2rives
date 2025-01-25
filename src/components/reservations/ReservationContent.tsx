import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReservations } from "@/hooks/useReservations";
import { ChildSelector } from "./ChildSelector";
import { DateSelector } from "./DateSelector";

export const ReservationContent = () => {
  const {
    selectedDates,
    selectedChild,
    setSelectedChild,
    children,
    handleSubmit,
    handleDateToggle,
    handleOptionChange,
    isDateReservedForChild,
  } = useReservations();

  if (!children || children.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">
          Vous devez d'abord ajouter un enfant dans votre profil.
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

          {selectedChild && (
            <DateSelector
              selectedDates={selectedDates}
              handleDateToggle={handleDateToggle}
              handleOptionChange={handleOptionChange}
              isDateAlreadyReserved={(date) => isDateReservedForChild(selectedChild, date)}
            />
          )}

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