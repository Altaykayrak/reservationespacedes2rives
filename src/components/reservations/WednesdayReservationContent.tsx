
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReservations } from "@/hooks/useReservations";
import { ChildSelector } from "./ChildSelector";
import { WednesdayDateSelector } from "./WednesdayDateSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays, CheckSquare, Utensils } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SuccessReservationDialog } from "./SuccessReservationDialog";
import { useChildrenData } from "@/hooks/useChildrenData";

export const WednesdayReservationContent = () => {
  const {
    selectedDates,
    setSelectedDates,
    selectedChild,
    setSelectedChild,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    isDateReservedForChild,
    showSuccessDialog,
    setShowSuccessDialog,
    selectAllDates,
    selectAllDatesWithoutMeal
  } = useReservations();
  
  const { wednesdayEligibleChildren, isLoading } = useChildrenData();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Logs pour déboguer
  console.log("wednesdayEligibleChildren dans WednesdayReservationContent:", wednesdayEligibleChildren);

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
            setSelectedDates={setSelectedDates}
          />

          {selectedChild && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={selectAllDates}
              >
                <CheckSquare className="h-4 w-4" />
                Sélectionner tous les mercredis
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={selectAllDatesWithoutMeal}
              >
                <Utensils className="h-4 w-4" />
                Sélectionner tous les mercredis sans repas
              </Button>
            </>
          )}

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
