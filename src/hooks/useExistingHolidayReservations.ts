
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useExistingHolidayReservations = (selectedChild: string) => {
  const { data: existingReservations, refetch: refetchReservations } = useQuery({
    queryKey: ["existing_holiday_reservations", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return [];
      const { data, error } = await supabase
        .from("holiday_reservations")
        .select("*")
        .eq("child_id", selectedChild)
        .eq("status", "confirmed");
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedChild,
  });

  const isDateAlreadyReserved = (date: Date) => {
    if (!existingReservations) return false;
    
    return existingReservations.some(reservation => {
      const reservationDate = new Date(reservation.reservation_date);
      return (
        reservationDate.getFullYear() === date.getFullYear() &&
        reservationDate.getMonth() === date.getMonth() &&
        reservationDate.getDate() === date.getDate()
      );
    });
  };

  return { existingReservations, refetchReservations, isDateAlreadyReserved };
};
