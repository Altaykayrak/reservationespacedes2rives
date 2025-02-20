
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";

export const useReservationQueries = () => {
  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: wednesdayReservations, refetch: refetchReservations } = useQuery({
    queryKey: ["wednesday_reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wednesday_reservations")
        .select(`
          *,
          children (
            first_name,
            last_name,
            school_class
          ),
          available_wednesdays (
            date
          )
        `)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as (Tables<"wednesday_reservations"> & {
        children: Tables<"children">;
        available_wednesdays: { date: string };
      })[];
    },
  });

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      return user;
    },
  });

  const isDateReservedForChild = (childId: string, date: Date) => {
    if (!wednesdayReservations) return false;
    
    const formattedDate = format(date, "yyyy-MM-dd");
    console.log("Vérification de la réservation pour la date:", formattedDate);
    console.log("Réservations existantes:", wednesdayReservations);
    
    const isReserved = wednesdayReservations.some(
      (reservation) => 
        reservation.child_id === childId &&
        reservation.available_wednesdays?.date === formattedDate
    );

    console.log("La date est-elle réservée ?", isReserved);
    return isReserved;
  };

  return {
    children,
    wednesdayReservations,
    refetchReservations,
    userProfile,
    isDateReservedForChild,
  };
};
