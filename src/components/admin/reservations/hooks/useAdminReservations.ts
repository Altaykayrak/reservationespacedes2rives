
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
            *,
            children (*),
            available_wednesdays (*)
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
