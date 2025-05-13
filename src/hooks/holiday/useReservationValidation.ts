
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useReservationValidation = (selectedChild: string | null) => {
  const { data: existingReservations } = useQuery({
    queryKey: ["existing_holiday_reservations", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return [];
      const { data, error } = await supabase
        .from("holiday_reservations")
        .select("*")
        .eq("child_id", selectedChild);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedChild,
  });

  const isDateAlreadyReserved = (date: Date): boolean => {
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

  return {
    existingReservations,
    isDateAlreadyReserved
  };
};
