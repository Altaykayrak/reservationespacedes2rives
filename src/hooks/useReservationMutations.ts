
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ReservationData {
  childId: string;
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useReservationMutations = (onSuccess: () => void) => {
  const { toast } = useToast();

  const generateReservationNumber = () => {
    return `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const createReservationMutation = useMutation({
    mutationFn: async (reservationData: ReservationData) => {
      console.log("Creating reservation with data:", reservationData);
      
      // First, get the wednesday_id for the given date
      const { data: wednesday, error: wednesdayError } = await supabase
        .from("available_wednesdays")
        .select("id")
        .eq("date", format(reservationData.date, "yyyy-MM-dd"))
        .single();

      if (wednesdayError) throw wednesdayError;
      if (!wednesday) throw new Error("Mercredi non disponible");

      const reservationNumber = generateReservationNumber();
      const { data, error } = await supabase
        .from("wednesday_reservations")
        .insert({
          child_id: reservationData.childId,
          wednesday_id: wednesday.id,
          without_meal: reservationData.withoutMeal,
          early_dropoff: reservationData.earlyDropoff,
          reservation_number: reservationNumber,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      console.error("Reservation error:", error);
      throw error;
    },
  });

  return { createReservationMutation };
};
