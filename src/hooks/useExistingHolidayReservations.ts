
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HolidayReservationWithChild } from "@/types/reservations";
import { toast } from "@/hooks/use-toast";

export const useExistingHolidayReservations = (selectedChild: string) => {
  // Using the correct query structure for React Query v5
  const { data: existingReservations, refetch: refetchReservations } = useQuery({
    queryKey: ["existing_holiday_reservations", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return [];
      console.log("Fetching reservations for child:", selectedChild);
      const { data, error } = await supabase
        .from("holiday_reservations_with_children")
        .select("*")
        .eq("child_id", selectedChild)
        .eq("status", "confirmed");
      
      if (error) {
        console.error("Error fetching reservations:", error);
        throw error;
      }
      console.log("Raw existing reservations:", data);
      
      // Transform the data safely to match our HolidayReservationWithChild type
      const transformedData = data?.map(reservation => {
        // We need to safely cast the children object
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
        } as HolidayReservationWithChild;
      }) || [];
      
      return transformedData;
    },
    enabled: !!selectedChild,
    // Using correct React Query v5 options
    staleTime: 0,
    gcTime: 0
  });

  const isDateAlreadyReserved = (date: Date): boolean => {
    if (!existingReservations) return false;
    try {
      console.log("Checking date:", date.toISOString(), "against reservations:", existingReservations);
      
      const result = existingReservations.some(reservation => {
        // S'assurer que la date est valide
        if (!reservation.reservation_date) return false;
        
        // Récupérer la date de réservation et la transformer en date locale
        const reservationDate = new Date(reservation.reservation_date);
        const dateToCheck = new Date(date);
        
        // Normaliser les dates pour la comparaison en local
        dateToCheck.setHours(0, 0, 0, 0);
        reservationDate.setHours(0, 0, 0, 0);
        
        const isSameDate = dateToCheck.getTime() === reservationDate.getTime();
        
        if (isSameDate) {
          console.log("Found matching reservation:", reservation);
        }
        return isSameDate;
      });

      console.log("Is date reserved?", result, "for date:", date.toISOString());
      return result;
    } catch (error) {
      console.error("Erreur lors de la vérification de la date réservée:", error);
      return false;
    }
  };

  // Ajout d'un effet de log pour déboguer
  console.log("Current existingReservations:", existingReservations);

  return { 
    existingReservations, 
    refetchReservations, 
    isDateAlreadyReserved 
  };
};
