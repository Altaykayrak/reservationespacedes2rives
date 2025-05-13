import { useState } from "react";
import { useChildrenData } from "@/hooks/useChildrenData";
import { useHolidayPeriods } from "@/hooks/useHolidayPeriods";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { nanoid } from "nanoid";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { useExistingHolidayReservations } from "./useExistingHolidayReservations";
import { getWeeksFromDates } from "@/utils/dateUtils";

interface Reservation {
  child_id: string;
  holiday_period_id: string;
  date: string;
  status: "pending" | "confirmed" | "cancelled";
}

export const useHolidayReservation = () => {
  const queryClient = useQueryClient();
  const { children } = useChildrenData();
  const { holidayPeriods } = useHolidayPeriods();
  const { existingReservations, refetch: refetchExistingReservations } = useExistingHolidayReservations();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const {
    data: availablePlacesData,
    isLoading: isLoadingAvailablePlaces,
    error: availablePlacesError,
    refetch: refetchAvailablePlaces,
  } = useQuery({
    queryKey: ["availableHolidayPlaces"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("holiday_periods")
        .select("id, available_places");
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  const getAvailablePlaces = (holidayPeriodId: string) => {
    const period = availablePlacesData?.find((p) => p.id === holidayPeriodId);
    return period ? period.available_places : 0;
  };

  const canReserve = (childId: string, holidayPeriodId: string, date: Date) => {
    // Check if the child is already reserved for this date and period
    if (existingReservations) {
      const formattedDate = format(date, "yyyy-MM-dd");
      const alreadyReserved = existingReservations.some(
        (reservation) =>
          reservation.child_id === childId &&
          reservation.holiday_period_id === holidayPeriodId &&
          reservation.date === formattedDate
      );
      if (alreadyReserved) {
        return false; // Already reserved, can't reserve again
      }
    }

    // Check against the selectedDates state
    const isDateSelected = selectedDates.some(
      (selectedDate) =>
        format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
    return isDateSelected; // Only reserve if the date is in selectedDates
  };

  const calculateTotalCost = (
    childId: string,
    holidayPeriodId: string,
    dates: Date[]
  ): number => {
    const child = children?.find((child) => child.id === childId);
    const period = holidayPeriods?.find((period) => period.id === holidayPeriodId);

    if (!child || !period) {
      return 0;
    }

    const baseCost = period.price_per_day;
    const ageDiscount = child.age < 6 ? 0.8 : 1; // 20% discount for children under 6

    return baseCost * ageDiscount * dates.length;
  };

  const createHolidayReservationMutation = useMutation({
    mutationFn: async ({
      childId,
      holidayPeriodId,
      dates,
    }: {
      childId: string;
      holidayPeriodId: string;
      dates: Date[];
    }) => {
      if (!Array.isArray(dates) || dates.length === 0) {
        throw new Error("No dates selected for reservation.");
      }

      const period = holidayPeriods?.find((period) => period.id === holidayPeriodId);
      if (!period) {
        throw new Error("Holiday period not found.");
      }

      const availablePlaces = getAvailablePlaces(holidayPeriodId);
      if (availablePlaces === undefined) {
        throw new Error("Failed to fetch available places.");
      }

      if (dates.length > availablePlaces) {
        throw new Error(
          `Not enough available places for this period. Available: ${availablePlaces}, Requested: ${dates.length}`
        );
      }

      const reservationsToCreate: Reservation[] = [];
      for (const date of dates) {
        if (!canReserve(childId, holidayPeriodId, date)) {
          continue;
        }

        reservationsToCreate.push({
          child_id: childId,
          holiday_period_id: holidayPeriodId,
          date: format(date, "yyyy-MM-dd"),
          status: "pending",
        });
      }

      if (reservationsToCreate.length === 0) {
        throw new Error("No reservations to create.");
      }

      const { data, error } = await supabase
        .from("holiday_reservations")
        .insert(reservationsToCreate);

      if (error) {
        throw new Error(error.message);
      }

      // Optimistically update available places
      await supabase
        .from("holiday_periods")
        .update({ available_places: availablePlaces - reservationsToCreate.length })
        .eq("id", holidayPeriodId);

      return data;
    },
    onSuccess: async () => {
      toast({
        title: "Réservations de vacances créées avec succès!",
        description: "Les réservations ont été enregistrées.",
      });
      await queryClient.invalidateQueries({ queryKey: ["holidayReservations"] });
      await queryClient.invalidateQueries({ queryKey: ["availableHolidayPlaces"] });
      await refetchExistingReservations();
      await refetchAvailablePlaces();
      setSelectedDates([]);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur lors de la création des réservations de vacances",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleDateSelection = (date: Date) => {
    const isSelected = selectedDates.some(
      (selectedDate) =>
        selectedDate.getFullYear() === date.getFullYear() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getDate() === date.getDate()
    );

    if (isSelected) {
      // If the date is already selected, remove it from the selection
      setSelectedDates((prevSelectedDates) =>
        prevSelectedDates.filter(
          (selectedDate) =>
            selectedDate.getFullYear() !== date.getFullYear() ||
            selectedDate.getMonth() !== date.getMonth() ||
            selectedDate.getDate() !== date.getDate()
        )
      );
    } else {
      // If the date is not selected, add it to the selection
      setSelectedDates((prevSelectedDates) => [...prevSelectedDates, date]);
    }
  };

  return {
    availablePlacesData,
    isLoadingAvailablePlaces,
    availablePlacesError,
    getAvailablePlaces,
    canReserve,
    calculateTotalCost,
    createHolidayReservation: createHolidayReservationMutation.mutateAsync,
    isCreatingHolidayReservation: createHolidayReservationMutation.isLoading,
    toggleDateSelection,
    selectedDates,
    setSelectedDates,
    refetchAvailablePlaces,
  };
};
