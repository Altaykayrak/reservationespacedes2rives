
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { validateMinimumDaysPerWeek } from "@/utils/dateUtils";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useReservationSubmission = (
  selectedChild: string,
  selectedDates: DateOption[],
  holidayPeriods: Tables<"available_holiday_periods">[] | null | undefined,
  isDateAlreadyReserved: (date: Date) => boolean,
  refetchReservations: () => Promise<any>,
  resetForm: () => void
) => {
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedChild) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un enfant.",
        variant: "destructive",
      });
      return;
    }

    if (selectedDates.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une date.",
        variant: "destructive",
      });
      return;
    }

    const alreadyReservedDates = selectedDates.filter(dateOption => 
      isDateAlreadyReserved(dateOption.date)
    );

    if (alreadyReservedDates.length > 0) {
      const datesList = alreadyReservedDates
        .map(d => format(d.date, "d MMMM yyyy", { locale: fr }))
        .join(", ");
      
      toast({
        title: "Dates déjà réservées",
        description: `Les dates suivantes sont déjà réservées pour cet enfant : ${datesList}`,
        variant: "destructive",
      });
      return;
    }

    if (!validateMinimumDaysPerWeek(selectedDates.map(d => d.date))) {
      toast({
        title: "Erreur de réservation",
        description: "Vous devez sélectionner au minimum 3 jours par semaine pendant les vacances.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Vérification préalable des réservations existantes
      for (const dateOption of selectedDates) {
        const period = holidayPeriods?.find(period => {
          const startDate = new Date(period.start_date);
          const endDate = new Date(period.end_date);
          return dateOption.date >= startDate && dateOption.date <= endDate;
        });

        if (!period) {
          throw new Error(`Période non trouvée pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);
        }

        // Vérification si la réservation existe déjà
        const { data: existingReservation, error: checkError } = await supabase
          .from("holiday_reservations")
          .select()
          .eq("child_id", selectedChild)
          .eq("period_id", period.id)
          .eq("reservation_date", format(dateOption.date, "yyyy-MM-dd"))
          .single();

        if (checkError && checkError.code !== "PGRST116") { // PGRST116 signifie qu'aucun résultat n'a été trouvé
          throw checkError;
        }

        if (existingReservation) {
          throw new Error(`Une réservation existe déjà pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);
        }
      }

      // Si toutes les vérifications sont passées, procéder aux insertions
      for (const dateOption of selectedDates) {
        const period = holidayPeriods?.find(period => {
          const startDate = new Date(period.start_date);
          const endDate = new Date(period.end_date);
          return dateOption.date >= startDate && dateOption.date <= endDate;
        });

        const { error: reservationError } = await supabase
          .from("holiday_reservations")
          .insert({
            child_id: selectedChild,
            period_id: period!.id,
            reservation_date: format(dateOption.date, "yyyy-MM-dd"),
            without_meal: dateOption.withoutMeal,
            early_dropoff: dateOption.earlyDropoff,
            reservation_number: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          });

        if (reservationError) throw reservationError;
      }

      toast({
        title: "Succès",
        description: "Les réservations ont été créées avec succès.",
      });

      await refetchReservations();
      resetForm();

      // Ajout du rechargement de la page après une réservation réussie
      window.location.reload();

    } catch (error: any) {
      console.error("Erreur lors de la création des réservations:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création des réservations.",
        variant: "destructive",
      });
    }
  };

  return { handleSubmit };
};
