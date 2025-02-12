
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WednesdayReservationWithChild } from "@/types/reservations";

export const useAdminReservations = (isAdmin: boolean | undefined) => {
  return useQuery({
    queryKey: ["admin_wednesday_reservations"],
    queryFn: async () => {
      try {
        console.log("Fetching wednesday reservations...");

        const { data, error } = await supabase
          .from("wednesday_reservations")
          .select(`
            id,
            child_id,
            wednesday_id,
            without_meal,
            early_dropoff,
            status,
            created_at,
            updated_at,
            children!wednesday_reservations_child_id_fkey (*),
            available_wednesdays!wednesday_reservations_wednesday_id_fkey (*)
          `)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error("Error fetching wednesday reservations:", error);
          throw error;
        }

        console.log("Fetched wednesday reservations:", data);
        return data as WednesdayReservationWithChild[];
      } catch (error) {
        console.error("Error in query function:", error);
        throw error;
      }
    },
    enabled: Boolean(isAdmin),
    refetchOnWindowFocus: false,
  });
};
