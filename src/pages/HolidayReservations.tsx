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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { getWeeksFromDates } from "@/utils/dateUtils";

const HolidayReservations = () => {
  const { toast } = useToast();
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showMinDaysDialog, setShowMinDaysDialog] = useState(false);
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
    // Vérifier si toutes les semaines ont au moins 3 jours sélectionnés
    const weeks = getWeeksFromDates(selectedDates.map(d => d.date));
    const hasInvalidWeek = weeks.some(weekDates => weekDates.length < 3);

    if (hasInvalidWeek) {
      setShowMinDaysDialog(true);
      return;
    }

    // Récupérer les dates déjà réservées pour cet enfant
    const existingReservations = reservations
      ?.filter(res => res.child_id === selectedChild)
      .map(res => new Date(res.reservation_date)) || [];

    const validation = validateHolidayReservations(
      selectedDates.map(d => d.date),
      existingReservations
    );
    
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

        <AlertDialog open={showMinDaysDialog} onOpenChange={setShowMinDaysDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Nombre de jours insuffisant</AlertDialogTitle>
              <AlertDialogDescription>
                Merci de sélectionner au minimum 3 jours par semaine
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowMinDaysDialog(false)}>
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