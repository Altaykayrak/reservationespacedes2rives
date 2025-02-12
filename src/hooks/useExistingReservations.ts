
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useExistingReservations = (selectedChild: string) => {
  const { data: existingReservations, refetch: refetchReservations } = useQuery({
    queryKey: ["wednesday_reservations", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return [];
      const { data, error } = await supabase
        .from("wednesday_reservations")
        .select("*, available_wednesdays!inner(*)")
        .eq("child_id", selectedChild);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedChild,
  });

  const isDateAlreadyReserved = (date: Date) => {
    if (!existingReservations) return false;
    return existingReservations.some(reservation => {
      const reservationDate = new Date(reservation.available_wednesdays.date);
      return reservationDate.getTime() === date.getTime();
    });
  };

  return { existingReservations, refetchReservations, isDateAlreadyReserved };
};
