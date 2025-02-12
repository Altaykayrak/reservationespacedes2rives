
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type WednesdayReservationWithChild = Tables<"wednesday_reservations"> & {
  children: {
    first_name: string;
    last_name: string;
    school_class: string;
  };
  available_wednesdays: {
    date: string;
  };
};

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
            children (
              first_name,
              last_name,
              school_class
            ),
            available_wednesdays (
              date
            )
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
