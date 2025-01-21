import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getWeeksFromDates } from "@/utils/dateUtils";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useHolidayReservation = () => {
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const { toast } = useToast();

  const { data: holidayPeriods } = useQuery({
    queryKey: ["holidayPeriods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*")
        .gte("end_date", new Date().toISOString().split("T")[0])
        .order("start_date");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: existingReservations } = useQuery({
    queryKey: ["reservations", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return [];
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("child_id", selectedChild);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedChild,
  });

  const isDateAlreadyReserved = (date: Date) => {
    if (!existingReservations) return false;
    return existingReservations.some(reservation => {
      const reservationDate = new Date(reservation.reservation_date);
      return reservationDate.getTime() === date.getTime();
    });
  };

  const handleDateToggle = (date: Date) => {
    const existingDate = selectedDates.find(d => d.date.getTime() === date.getTime());
    if (existingDate) {
      setSelectedDates(selectedDates.filter(d => d.date.getTime() !== date.getTime()));
    } else {
      setSelectedDates([...selectedDates, { date, withoutMeal: false, earlyDropoff: false }]);
    }
  };

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    setSelectedDates(selectedDates.map(d => 
      d.date.getTime() === date.getTime() 
        ? { ...d, [option]: value }
        : d
    ));
  };

  const validateMinimumDaysPerWeek = () => {
    const selectedDateObjects = selectedDates.map(d => d.date);
    const weekGroups = getWeeksFromDates(selectedDateObjects);
    
    // Check if any week has less than 3 days
    const hasInvalidWeek = weekGroups.some(weekDates => weekDates.length < 3);
    
    if (hasInvalidWeek) {
      toast({
        title: "Erreur de réservation",
        description: "Vous devez sélectionner au minimum 3 jours par semaine pendant les vacances.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

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

    // Check for already reserved dates
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

    // Validate minimum days per week
    if (!validateMinimumDaysPerWeek()) {
      return;
    }

    try {
      for (const dateOption of selectedDates) {
        const period = holidayPeriods?.find(period => {
          const startDate = new Date(period.start_date);
          const endDate = new Date(period.end_date);
          return dateOption.date >= startDate && dateOption.date <= endDate;
        });

        if (!period) {
          throw new Error(`Période non trouvée pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);
        }

        const { error: reservationError } = await supabase
          .from("reservations")
          .insert({
            child_id: selectedChild,
            period_id: period.id,
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

      setSelectedDates([]);
      setSelectedPeriod("");

    } catch (error: any) {
      console.error("Erreur lors de la création des réservations:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création des réservations.",
        variant: "destructive",
      });
    }
  };

  return {
    selectedDates,
    setSelectedDates,
    selectedChild,
    setSelectedChild,
    selectedPeriod,
    setSelectedPeriod,
    children,
    holidayPeriods,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    isDateAlreadyReserved
  };
};