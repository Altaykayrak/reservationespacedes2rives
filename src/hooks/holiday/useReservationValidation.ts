
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export const useReservationValidation = (childId: string | null) => {
  // Utilisation de useQuery avec toutes les précautions
  const { data: existingReservations } = useQuery({
    queryKey: ["holiday_reservations", childId],
    queryFn: async () => {
      if (!childId) return [];
      
      console.log("Fetching existing reservations for child:", childId);
      
      const { data, error } = await supabase
        .from("holiday_reservations")
        .select("reservation_date")
        .eq("child_id", childId)
        .eq("status", "confirmed");
      
      if (error) {
        console.error("Error fetching existing reservations:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!childId, // N'exécuter la requête que si childId existe
    staleTime: 5 * 60 * 1000, // Garder les données fraîches pendant 5 minutes
  });
  
  // Utiliser useMemo pour mémoriser la fonction isDateAlreadyReserved
  const isDateAlreadyReserved = useMemo(() => {
    return (date: Date) => {
      // Ensure existingReservations is defined, otherwise return false
      if (!existingReservations || existingReservations.length === 0) return false;
      
      // Normaliser la date à minuit UTC
      const dateToCheck = new Date(date);
      dateToCheck.setHours(0, 0, 0, 0);
      const dateStr = dateToCheck.toISOString().split("T")[0]; // YYYY-MM-DD format
      
      return existingReservations.some(reservation => {
        // Vérifier si la date est au format string ou objet Date
        const resDate = typeof reservation.reservation_date === "string" 
          ? reservation.reservation_date 
          : new Date(reservation.reservation_date).toISOString().split("T")[0];
        
        return resDate === dateStr;
      });
    };
  }, [existingReservations]);
  
  return {
    existingReservations: existingReservations || [],
    isDateAlreadyReserved,
  };
};
