import { HolidayReservationCalendar } from "@/components/reservations/HolidayReservationCalendar";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { ReservationsList } from "@/components/reservations/ReservationsList";
import { useReservations } from "@/hooks/useReservations";
import { validateHolidayReservations } from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/ui/navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const HolidayReservations = () => {
  const { toast } = useToast();
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const {
    selectedDates,
    setSelectedDates,
    selectedChild,
    setSelectedChild,
    children,
    reservations,
    handleSubmit,
    isSubmitting,
    isDateReservedForChild
  } = useReservations();

  const handleValidatedSubmit = () => {
    const validation = validateHolidayReservations(selectedDates.map(d => d.date));
    
    if (!validation.isValid) {
      toast({
        title: "Erreur de validation",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    // Vérifier si des dates sont déjà réservées pour cet enfant
    const hasConflicts = selectedDates.some(dateOption => 
      isDateReservedForChild(selectedChild, dateOption.date)
    );

    if (hasConflicts) {
      setShowWarningDialog(true);
      return;
    }

    handleSubmit();
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4 space-y-8">
        <h1 className="text-2xl font-bold mb-6">Réservations de vacances</h1>
        
        <div className="space-y-4 md:space-y-8">
          <HolidayReservationCalendar
            selectedDates={selectedDates.map(d => d.date)}
            setSelectedDates={dates => setSelectedDates(dates.map(date => ({
              date,
              withoutMeal: false,
              earlyDropoff: false,
            })))}
          />
          <ReservationForm
            selectedDates={selectedDates.map(d => d.date)}
            children={children}
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            onSubmit={handleValidatedSubmit}
            isSubmitting={isSubmitting}
            setSelectedDates={setSelectedDates}
          />
        </div>

        <ReservationsList reservations={reservations} />

        <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Dates déjà réservées</AlertDialogTitle>
              <AlertDialogDescription>
                Vous avez déjà réservé certaines de ces dates pour votre enfant.
                Veuillez sélectionner d'autres dates.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowWarningDialog(false)}>
                D'accord
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default HolidayReservations;