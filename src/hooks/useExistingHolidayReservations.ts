
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useExistingHolidayReservations = (selectedChild: string) => {
  const { data: existingReservations, refetch: refetchReservations } = useQuery({
    queryKey: ["existing_holiday_reservations", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return [];
      console.log("Fetching reservations for child:", selectedChild);
      const { data, error } = await supabase
        .from("holiday_reservations")
        .select("*")
        .eq("child_id", selectedChild)
        .eq("status", "confirmed");
      
      if (error) throw error;
      console.log("Existing reservations:", data);
      return data || [];
    },
    enabled: !!selectedChild,
  });

  const isDateAlreadyReserved = (date: Date) => {
    if (!existingReservations) return false;
    console.log("Checking date:", date, "against reservations:", existingReservations);
    
    const result = existingReservations.some(reservation => {
      const reservationDate = new Date(reservation.reservation_date);
      const isSameDate = 
        reservationDate.getFullYear() === date.getFullYear() &&
        reservationDate.getMonth() === date.getMonth() &&
        reservationDate.getDate() === date.getDate();
      
      if (isSameDate) {
        console.log("Found matching reservation:", reservation);
      }
      return isSameDate;
    });

    console.log("Is date reserved?", result);
    return result;
  };

  return { existingReservations, refetchReservations, isDateAlreadyReserved };
};
