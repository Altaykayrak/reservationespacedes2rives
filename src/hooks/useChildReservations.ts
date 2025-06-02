
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useChildReservations = (childId: string) => {
  const { data: hasReservations, isLoading } = useQuery({
    queryKey: ["child_reservations", childId],
    queryFn: async () => {
      // Vérifier les réservations de mercredi
      const { data: wednesdayReservations } = await supabase
        .from("wednesday_reservations")
        .select("id")
        .eq("child_id", childId)
        .eq("status", "confirmed");

      // Vérifier les réservations de vacances
      const { data: holidayReservations } = await supabase
        .from("holiday_reservations")
        .select("id")
        .eq("child_id", childId)
        .eq("status", "confirmed");

      const hasActiveReservations = 
        (wednesdayReservations && wednesdayReservations.length > 0) ||
        (holidayReservations && holidayReservations.length > 0);

      return hasActiveReservations;
    },
    enabled: !!childId,
  });

  return { hasReservations, isLoading };
};
