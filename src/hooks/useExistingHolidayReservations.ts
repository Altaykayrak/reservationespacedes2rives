
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useExistingHolidayReservations = (selectedChild: string) => {
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
      return data || [];
    },
    enabled: !!selectedChild,
    gcTime: 0,      // Désactive le garbage collection
    staleTime: 0,   // Désactive le cache pour toujours avoir les données fraîches
    refetchOnMount: true, // Force le rechargement à chaque montage
    refetchOnWindowFocus: true // Recharge quand la fenêtre reprend le focus
  });

  const isDateAlreadyReserved = (date: Date) => {
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
