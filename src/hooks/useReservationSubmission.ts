
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { validateMinimumDaysPerWeek } from "@/utils/dateUtils";
import { useState } from "react";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface NoSpotsDialogState {
  isOpen: boolean;
  schoolClass: string;
  date: Date;
}

export const useReservationSubmission = (
  selectedChild: string,
  selectedDates: DateOption[],
  holidayPeriods: Tables<"available_holiday_periods">[] | null | undefined,
  isDateAlreadyReserved: (date: Date) => boolean,
  refetchReservations: () => Promise<any>,
  resetForm: () => void
) => {
  const [noSpotsDialog, setNoSpotsDialog] = useState<NoSpotsDialogState>({
    isOpen: false,
    schoolClass: '',
    date: new Date()
  });

  const handleSubmit = async () => {
    if (!selectedChild) {
      alert("Veuillez sélectionner un enfant.");
      return;
    }

    if (selectedDates.length === 0) {
      alert("Veuillez sélectionner au moins une date.");
      return;
    }

    const alreadyReservedDates = selectedDates.filter(dateOption => 
      isDateAlreadyReserved(dateOption.date)
    );

    if (alreadyReservedDates.length > 0) {
      const datesList = alreadyReservedDates
        .map(d => format(d.date, "d MMMM yyyy", { locale: fr }))
        .join(", ");
      
      alert(`Les dates suivantes sont déjà réservées pour cet enfant : ${datesList}`);
      return;
    }

    if (!validateMinimumDaysPerWeek(selectedDates.map(d => d.date))) {
      alert("Vous devez sélectionner au minimum 3 jours par semaine pendant les vacances.");
      return;
    }

    try {
      // Récupérer la classe de l'enfant
      const { data: childData, error: childError } = await supabase
        .from("children")
        .select("school_class")
        .eq("id", selectedChild)
        .single();

      if (childError) throw childError;

      // Vérifier les places disponibles pour chaque date
      for (const dateOption of selectedDates) {
        const dateStr = format(dateOption.date, "yyyy-MM-dd");
        
        const period = holidayPeriods?.find(period => {
          const startDate = new Date(period.start_date);
          const endDate = new Date(period.end_date);
          const currentDate = new Date(dateStr);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          currentDate.setHours(0, 0, 0, 0);
          return currentDate >= startDate && currentDate <= endDate;
        });

        if (!period) {
          throw new Error(`Période non trouvée pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);
        }

        // Vérifier les places disponibles
        const { data: spotsLeft, error: spotsError } = await supabase
          .rpc('check_holiday_spots_available', {
            period_id: period.id,
            reservation_date: dateStr,
            child_school_class: childData.school_class
          });

        if (spotsError) throw spotsError;

        if (spotsLeft <= 0) {
          setNoSpotsDialog({
            isOpen: true,
            schoolClass: childData.school_class,
            date: dateOption.date
          });
          return;
        }

        const { data: existingReservation, error: checkError } = await supabase
          .from("holiday_reservations")
          .select()
          .eq("child_id", selectedChild)
          .eq("period_id", period.id)
          .eq("reservation_date", dateStr)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingReservation) {
          throw new Error(`Une réservation existe déjà pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);
        }
      }

      // Si toutes les vérifications sont passées, créer les réservations
      for (const dateOption of selectedDates) {
        const dateStr = format(dateOption.date, "yyyy-MM-dd");
        const period = holidayPeriods?.find(period => {
          const startDate = new Date(period.start_date);
          const endDate = new Date(period.end_date);
          const currentDate = new Date(dateStr);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          currentDate.setHours(0, 0, 0, 0);
          return currentDate >= startDate && currentDate <= endDate;
        });

        const { error: reservationError } = await supabase
          .from("holiday_reservations")
          .insert({
            child_id: selectedChild,
            period_id: period!.id,
            reservation_date: dateStr,
            without_meal: dateOption.withoutMeal,
            early_dropoff: dateOption.earlyDropoff,
            status: 'confirmed',
            reservation_number: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          });

        if (reservationError) throw reservationError;
      }

      await refetchReservations();
      resetForm();

    } catch (error: any) {
      console.error("Erreur lors de la création des réservations:", error);
      alert(error.message || "Une erreur est survenue lors de la création des réservations.");
    }
  };

  return { 
    handleSubmit,
    noSpotsDialog,
    setNoSpotsDialog
  };
};
