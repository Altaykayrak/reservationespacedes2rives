
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReservations } from "@/hooks/useReservations";
import { ChildSelector } from "./ChildSelector";
import { WednesdayDateSelector } from "./WednesdayDateSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays, CheckSquare, Loader, Utensils } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SuccessReservationDialog } from "./SuccessReservationDialog";
import { useChildrenData } from "@/hooks/useChildrenData";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

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
    selectAllDatesWithoutMeal,
    isSubmitting
  } = useReservations();
  const {
    wednesdayEligibleChildren,
    isLoading
  } = useChildrenData();
  
  // State for blinking animation
  const [isBlinking, setIsBlinking] = useState(true);
  
  // Effect for controlling the 6-second blinking animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBlinking(false);
    }, 6000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }

  // Logs pour déboguer
  console.log("wednesdayEligibleChildren dans WednesdayReservationContent:", wednesdayEligibleChildren);
  return <div className="space-y-6">
      <Alert className={isBlinking ? "animate-blink border-2 border-red-500 bg-red-50 text-red-800" : ""}>
        <CalendarDays className="h-4 w-4" />
        <AlertDescription>Vous pouvez sélectionner plusieurs mercredis à la fois pour créer vos réservations. Pour vos enfants en petite section nous vous invitons à contacter l'accueil.</AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="space-y-4">
          <ChildSelector selectedChild={selectedChild} setSelectedChild={setSelectedChild} children={wednesdayEligibleChildren} setSelectedDates={setSelectedDates} />

          {selectedChild && <>
              <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2" onClick={selectAllDates}>
                <CheckSquare className="h-4 w-4" />
                Sélectionner tous les mercredis
              </Button>
              
              <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2" onClick={selectAllDatesWithoutMeal}>
                <Utensils className="h-4 w-4" />
                Sélectionner tous les mercredis sans repas
              </Button>
            </>}

          <ScrollArea className="h-[400px]">
            <WednesdayDateSelector selectedDates={selectedDates} handleDateToggle={handleDateToggle} handleOptionChange={handleOptionChange} isDateAlreadyReserved={date => isDateReservedForChild(selectedChild, date)} selectedChild={selectedChild} />
          </ScrollArea>

          {isSubmitting ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Réservation en cours...</span>
                <span className="text-sm">{Math.floor(Math.random() * 31) + 70}%</span>
              </div>
              <Progress value={Math.floor(Math.random() * 31) + 70} className="h-2" />
              <div className="flex justify-center mt-2">
                <Loader className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          ) : (
            <Button onClick={handleSubmit} className="w-full" disabled={!selectedChild || selectedDates.length === 0}>
              Confirmer {selectedDates.length > 1 ? 'les réservations' : 'la réservation'}
            </Button>
          )}
        </div>
      </Card>

      <SuccessReservationDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog} />
    </div>;
};
