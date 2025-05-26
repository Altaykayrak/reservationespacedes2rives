
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
        console.log("📝 RAW Wednesday data:", wednesdayData);
        if (wednesdayData && wednesdayData.length > 0) {
          console.log("📝 Sample wednesday reservation:", wednesdayData[0]);
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
          .order('created_at', { ascending: false });

        if (holidayError) {
          console.error("❌ Error fetching holiday reservations:", holidayError);
          throw holidayError;
        }

        console.log("📊 Holiday reservations found:", holidayData?.length || 0);
        console.log("📝 RAW Holiday data:", holidayData);
        if (holidayData && holidayData.length > 0) {
          console.log("📝 Sample holiday reservation:", holidayData[0]);
        }

        // Rechercher spécifiquement l'enfant avec l'ID mentionné
        const targetChildId = "272c2d54-e3f3-4146-b5b7-a47385a2c1ab";
        const targetWednesdayReservations = wednesdayData?.filter(r => r.child_id === targetChildId) || [];
        const targetHolidayReservations = holidayData?.filter(r => r.child_id === targetChildId) || [];
        
        console.log(`🎯 Réservations BRUTES trouvées pour l'enfant ${targetChildId}:`);
        console.log(`  - Mercredis: ${targetWednesdayReservations.length}`, targetWednesdayReservations);
        console.log(`  - Vacances: ${targetHolidayReservations.length}`, targetHolidayReservations);

        if (targetWednesdayReservations.length > 0) {
          console.log("🔍 Détails enfant mercredi:", targetWednesdayReservations[0].children);
        }
        if (targetHolidayReservations.length > 0) {
          console.log("🔍 Détails enfant vacances:", targetHolidayReservations[0].children);
          console.log("🔍 Structure complète première réservation vacances:", JSON.stringify(targetHolidayReservations[0], null, 2));
        }

        // Vérifier la structure des données avant transformation
        if (holidayData && holidayData.length > 0) {
          console.log("🔍 Structure du premier élément holiday:", JSON.stringify(holidayData[0], null, 2));
        }

        // Transform the wednesday reservations data
        const transformedWednesdayData = wednesdayData?.map(reservation => {
          console.log("🔄 Transforming wednesday reservation:", reservation.id);
          return {
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
          };
        }) as WednesdayReservationWithChild[];

        // Transform the holiday reservations data
        const transformedHolidayData = holidayData?.map(reservation => {
          console.log("🔄 Transforming holiday reservation:", reservation.id, "for child:", reservation.child_id);
          
          // Vérifier la structure des données children
          console.log("🔍 Children data structure:", reservation.children);
          
          return {
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
          };
        }) as HolidayReservationWithChild[];

        // Vérification finale après transformation
        const finalTargetWednesdayReservations = transformedWednesdayData?.filter(r => r.child_id === targetChildId) || [];
        const finalTargetHolidayReservations = transformedHolidayData?.filter(r => r.child_id === targetChildId) || [];
        
        console.log(`🎯 Réservations TRANSFORMÉES pour l'enfant ${targetChildId}:`);
        console.log(`  - Mercredis: ${finalTargetWednesdayReservations.length}`, finalTargetWednesdayReservations);
        console.log(`  - Vacances: ${finalTargetHolidayReservations.length}`, finalTargetHolidayReservations);

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
