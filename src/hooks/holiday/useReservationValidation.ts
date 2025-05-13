
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export const useReservationValidation = (childId: string | null) => {
  // Récupération des réservations existantes
  const { data: existingReservations } = useQuery({
    queryKey: ["existing_holiday_reservations", childId],
    queryFn: async () => {
      if (!childId) return [];
      
      console.log("Fetching existing reservations for child:", childId);
      
      const { data, error } = await supabase
        .from("holiday_reservations")
        .select("reservation_date")
        .eq("child_id", childId)
        .eq("status", "confirmed");
      
      if (error) {
        console.error("Erreur lors de la récupération des réservations:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: Boolean(childId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10 // 10 minutes
  });

  // Utiliser useMemo pour mémoriser la fonction isDateAlreadyReserved
  const isDateAlreadyReserved = useMemo(() => {
    return (date: Date) => {
      // Vérifier si existingReservations est défini
      if (!existingReservations || existingReservations.length === 0) return false;
      
      try {
        // Normaliser la date à minuit UTC
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        
        // Vérifier si la date existe déjà dans les réservations
        return existingReservations.some(reservation => {
          if (!reservation.reservation_date) return false;
          
          const reservationDate = new Date(reservation.reservation_date);
          reservationDate.setHours(0, 0, 0, 0);
          
          return normalizedDate.getTime() === reservationDate.getTime();
        });
      } catch (error) {
        console.error("Erreur lors de la vérification des dates:", error);
        return false;
      }
    };
  }, [existingReservations]);
  
  return {
    existingReservations: existingReservations || [],
    isDateAlreadyReserved,
  };
};
