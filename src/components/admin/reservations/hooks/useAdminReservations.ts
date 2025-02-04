
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type ReservationWithChild = Tables<"reservations"> & {
  children: {
    first_name: string;
    last_name: string;
    school_class: string;
  };
};

export const useAdminReservations = (isAdmin: boolean | undefined) => {
  return useQuery({
    queryKey: ["admin_reservations"],
    queryFn: async () => {
      try {
        console.log("Fetching reservations...");

        const { data, error } = await supabase
          .from("reservations")
          .select(`
            *,
            children (
              first_name,
              last_name,
              school_class
            )
          `)
          .order('reservation_date', { ascending: true });
        
        if (error) {
          console.error("Error fetching reservations:", error);
          throw error;
        }

        console.log("Fetched reservations:", data);
        return data as ReservationWithChild[];
      } catch (error) {
        console.error("Error in query function:", error);
        throw error;
      }
    },
    enabled: Boolean(isAdmin),
    refetchOnWindowFocus: false,
  });
};
