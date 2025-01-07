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
      
      const reservationNumber = generateReservationNumber();
      const { data, error } = await supabase
        .from("reservations")
        .insert({
          child_id: reservationData.childId,
          reservation_date: format(reservationData.date, "yyyy-MM-dd"),
          without_meal: reservationData.withoutMeal,
          early_dropoff: reservationData.earlyDropoff,
          reservation_number: reservationNumber,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Réservation confirmée",
        description: "Votre réservation a été enregistrée avec succès. Un email de confirmation vous a été envoyé.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la réservation.",
        variant: "destructive",
      });
    },
  });

  return { createReservationMutation };
};