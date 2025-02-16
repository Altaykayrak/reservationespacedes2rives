
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useExistingReservations = (selectedChild: string) => {
  const { data: existingReservations, refetch: refetchReservations } = useQuery({
    queryKey: ["wednesday_reservations", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return [];
      const { data, error } = await supabase
        .from("wednesday_reservations_with_children")
        .select(`
          id,
          child_id,
          wednesday_id,
          without_meal,
          early_dropoff,
          status,
          created_at,
          updated_at,
          children,
          available_wednesdays:wednesday_id(
            id,
            date,
            max_participants_kindergarten,
            max_participants_primary
          )
        `)
        .eq("child_id", selectedChild)
        .eq("status", "confirmed");
      
      if (error) throw error;
      console.log("Réservations récupérées:", data);
      return data;
    },
    enabled: !!selectedChild,
  });

  const isDateAlreadyReserved = (date: Date) => {
    if (!existingReservations) return false;
    return existingReservations.some(reservation => {
      if (!reservation.available_wednesdays) return false;
      const reservationDate = new Date(reservation.available_wednesdays.date);
      return reservationDate.getTime() === date.getTime();
    });
  };

  return { existingReservations, refetchReservations, isDateAlreadyReserved };
};
