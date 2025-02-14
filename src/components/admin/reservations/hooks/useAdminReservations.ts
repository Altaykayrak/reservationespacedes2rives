
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";

interface AdminReservations {
  wednesdayReservations: WednesdayReservationWithChild[] | null;
  holidayReservations: HolidayReservationWithChild[] | null;
}

export const useAdminReservations = (isAdmin: boolean | undefined) => {
  return useQuery({
    queryKey: ["admin_reservations"],
    queryFn: async (): Promise<AdminReservations> => {
      try {
        console.log("Fetching all reservations...");

        // Récupérer les réservations du mercredi
        const { data: wednesdayData, error: wednesdayError } = await supabase
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
        
        if (wednesdayError) {
          console.error("Error fetching wednesday reservations:", wednesdayError);
          throw wednesdayError;
        }

        // Récupérer les réservations des vacances
        const { data: holidayData, error: holidayError } = await supabase
          .from("holiday_reservations")
          .select(`
            id,
            child_id,
            period_id,
            reservation_date,
            without_meal,
            early_dropoff,
            status,
            created_at,
            updated_at,
            children (*),
            available_holiday_periods (*)
          `)
          .order('created_at', { ascending: true });

        if (holidayError) {
          console.error("Error fetching holiday reservations:", holidayError);
          throw holidayError;
        }

        console.log("Fetched wednesday reservations:", wednesdayData);
        console.log("Fetched holiday reservations:", holidayData);

        return {
          wednesdayReservations: wednesdayData,
          holidayReservations: holidayData
        };
      } catch (error) {
        console.error("Error in query function:", error);
        throw error;
      }
    },
    enabled: Boolean(isAdmin),
    refetchOnWindowFocus: false,
  });
};
