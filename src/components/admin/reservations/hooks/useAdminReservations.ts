
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";

interface AdminReservations {
  wednesdayReservations: WednesdayReservationWithChild[] | null;
  holidayReservations: HolidayReservationWithChild[] | null;
}

type BaseReservation = {
  id: string;
  child_id: string;
  status: string;
  without_meal: boolean;
  early_dropoff: boolean;
  created_at: string;
  updated_at: string;
};

export const useAdminReservations = (isAdmin: boolean | undefined) => {
  return useQuery({
    queryKey: ["admin_reservations"],
    queryFn: async (): Promise<AdminReservations> => {
      try {
        console.log("Fetching all reservations...");

        // Récupérer les réservations du mercredi depuis la vue
        const { data: wednesdayData, error: wednesdayError } = await supabase
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
            reservation_number,
            children,
            available_wednesdays!wednesday_reservations_wednesday_id_fkey (*)
          `)
          .order('created_at', { ascending: true });
        
        if (wednesdayError) {
          console.error("Error fetching wednesday reservations:", wednesdayError);
          throw wednesdayError;
        }

        // Récupérer les réservations des vacances depuis la vue
        const { data: holidayData, error: holidayError } = await supabase
          .from("holiday_reservations_with_children")
          .select(`
            id,
            child_id,
            period_id,
            reservation_date,
            reservation_number,
            without_meal,
            early_dropoff,
            status,
            created_at,
            updated_at,
            children,
            available_holiday_periods (*)
          `)
          .order('created_at', { ascending: true });

        if (holidayError) {
          console.error("Error fetching holiday reservations:", holidayError);
          throw holidayError;
        }

        console.log("Fetched wednesday reservations:", wednesdayData);
        console.log("Fetched holiday reservations:", holidayData);

        // Transform the wednesday reservations data
        const transformedWednesdayData = wednesdayData?.map(reservation => ({
          ...reservation,
          children: {
            id: (reservation.children as any).id,
            first_name: (reservation.children as any).first_name,
            last_name: (reservation.children as any).last_name,
            school_class: (reservation.children as any).school_class,
            profile: {
              school_city: (reservation.children as any).school_city || ''
            }
          },
          available_wednesdays: reservation.available_wednesdays
        })) as WednesdayReservationWithChild[];

        // Transform the holiday reservations data
        const transformedHolidayData = holidayData?.map(reservation => ({
          ...reservation,
          children: {
            id: (reservation.children as any).id,
            first_name: (reservation.children as any).first_name,
            last_name: (reservation.children as any).last_name,
            school_class: (reservation.children as any).school_class,
            profile: {
              school_city: (reservation.children as any).school_city || ''
            }
          },
          available_holiday_periods: reservation.available_holiday_periods
        })) as HolidayReservationWithChild[];

        return {
          wednesdayReservations: transformedWednesdayData,
          holidayReservations: transformedHolidayData
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
