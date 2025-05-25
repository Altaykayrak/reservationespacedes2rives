import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HolidayReservationWithChild } from "@/types/reservations";
import { toast } from "@/hooks/use-toast";

export const useExistingHolidayReservations = (selectedChild: string) => {
  const {
    data: existingReservations,
    refetch: refetchReservations,
    isLoading
  } = useQuery({
    queryKey: ["existing_holiday_reservations", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return [];

      console.log("🔄 Fetching reservations for child:", selectedChild);

      const { data, error } = await supabase
        .from("holiday_reservations_with_children")
        .select("*")
        .eq("child_id", selectedChild)
        .eq("status", "confirmed");

      if (error) {
        console.error("❌ Error fetching reservations:", error);
        toast.error("Erreur lors de la récupération des réservations");
        throw error;
      }

      console.log("✅ Raw existing reservations:", data);

      const transformedData: HolidayReservationWithChild[] = data?.map(reservation => {
        const childrenData = reservation.children as Record<string, any> || {};

        return {
          id: reservation.id || '',
          child_id: reservation.child_id || '',
          period_id: reservation.period_id || '',
          reservation_date: reservation.reservation_date || '',
          reservation_number: reservation.reservation_number || '',
          without_meal: reservation.without_meal || false,
          early_dropoff: reservation.early_dropoff || false,
          status: reservation.status || '',
          created_at: reservation.created_at || '',
          updated_at: reservation.updated_at || '',
          children: {
            id: childrenData.id || '',
            first_name: childrenData.first_name || '',
            last_name: childrenData.last_name || '',
            school_class: childrenData.school_class || '',
            profile: {
              school_city: childrenData.profile?.school_city || ''
            }
          }
        };
      }) || [];

      return transformedData;
    },
    enabled: !!selectedChild, // ⛔ Ne lance la requête que si selectedChild est défini
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10 // 10 minutes
  });

  const isDateAlreadyReserved = (date: Date): boolean => {
    if (!existingReservations) return false;

    try {
      const result = existingReservations.some(reservation => {
        if (!reservation.reservation_date) return false;

        const reservationDate = new Date(reservation.reservation_date);
        const dateToCheck = new Date(date);
        dateToCheck.setHours(0, 0, 0, 0);
        reservationDate.setHours(0, 0, 0, 0);

        return dateToCheck.getTime() === reservationDate.getTime();
      });

      console.log("📅 Checked date:", date.toISOString(), "→ reserved:", result);
      return result;
    } catch (error) {
      console.error("⚠️ Erreur lors de la vérification de la date réservée:", error);
      return false;
    }
  };

  return {
    existingReservations,
    refetchReservations,
    isDateAlreadyReserved,
    isLoading
  };
};
