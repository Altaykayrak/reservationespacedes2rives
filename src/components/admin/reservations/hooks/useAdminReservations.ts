
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
        console.log("🔍 Fetching all admin reservations...");

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
          .order('created_at', { ascending: false });
        
        if (wednesdayError) {
          console.error("❌ Error fetching wednesday reservations:", wednesdayError);
          throw wednesdayError;
        }

        console.log("📊 Wednesday reservations found:", wednesdayData?.length || 0);

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
          .order('created_at', { ascending: false });

        if (holidayError) {
          console.error("❌ Error fetching holiday reservations:", holidayError);
          throw holidayError;
        }

        console.log("📊 Holiday reservations found:", holidayData?.length || 0);

        // Transform the wednesday reservations data
        const transformedWednesdayData = wednesdayData?.map(reservation => {
          const childrenData = reservation.children as any;
          return {
            ...reservation,
            children: {
              id: childrenData.id,
              first_name: childrenData.first_name,
              last_name: childrenData.last_name,
              school_class: childrenData.school_class,
              profile: {
                school_city: '' // Valeur vide puisque non utilisée
              }
            },
            available_wednesdays: reservation.available_wednesdays
          };
        }) as WednesdayReservationWithChild[];

        // Transform the holiday reservations data
        const transformedHolidayData = holidayData?.map(reservation => {
          const childrenData = reservation.children as any;
          
          return {
            ...reservation,
            children: {
              id: childrenData.id,
              first_name: childrenData.first_name,
              last_name: childrenData.last_name,
              school_class: childrenData.school_class,
              profile: {
                school_city: '' // Valeur vide puisque non utilisée
              }
            },
            available_holiday_periods: reservation.available_holiday_periods
          };
        }) as HolidayReservationWithChild[];

        console.log("✅ Final transformed data:", {
          wednesday: transformedWednesdayData?.length || 0,
          holiday: transformedHolidayData?.length || 0
        });

        return {
          wednesdayReservations: transformedWednesdayData,
          holidayReservations: transformedHolidayData
        };
      } catch (error) {
        console.error("💥 Error in admin reservations query:", error);
        throw error;
      }
    },
    enabled: Boolean(isAdmin),
    refetchOnWindowFocus: false,
    staleTime: 0, // Toujours refetch pour s'assurer d'avoir les dernières données
    retry: 1,
  });
};
