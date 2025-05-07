
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReservations } from "@/hooks/useReservations";
import { ChildSelector } from "./ChildSelector";
import { WednesdayDateSelector } from "./WednesdayDateSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SuccessReservationDialog } from "./SuccessReservationDialog";
import { useChildrenData } from "@/hooks/useChildrenData";

export const WednesdayReservationContent = () => {
  const {
    selectedDates,
    selectedChild,
    setSelectedChild,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    isDateReservedForChild,
    showSuccessDialog,
    setShowSuccessDialog
  } = useReservations();
  
  const { wednesdayEligibleChildren } = useChildrenData();

  return (
    <div className="space-y-6">
      <Alert>
        <CalendarDays className="h-4 w-4" />
        <AlertDescription>
          Vous pouvez sélectionner plusieurs mercredis à la fois pour créer vos réservations.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="space-y-4">
          <ChildSelector
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            children={wednesdayEligibleChildren}
          />

          <ScrollArea className="h-[400px]">
            <WednesdayDateSelector
              selectedDates={selectedDates}
              handleDateToggle={handleDateToggle}
              handleOptionChange={handleOptionChange}
              isDateAlreadyReserved={(date) => isDateReservedForChild(selectedChild, date)}
              selectedChild={selectedChild}
            />
          </ScrollArea>

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!selectedChild || selectedDates.length === 0}
          >
            Confirmer {selectedDates.length > 1 ? 'les réservations' : 'la réservation'}
          </Button>
        </div>
      </Card>

      <SuccessReservationDialog 
        open={showSuccessDialog} 
        onOpenChange={setShowSuccessDialog}
      />
    </div>
  );
};
