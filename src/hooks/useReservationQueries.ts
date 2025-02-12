
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
          )
        `)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as (Tables<"wednesday_reservations"> & {
        children: Tables<"children">;
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
    
    // Pour les mercredis, nous cherchons une réservation correspondante
    return wednesdayReservations.some(
      (reservation) => 
        reservation.child_id === childId &&
        reservation.wednesday_id === format(date, "yyyy-MM-dd")
    );
  };

  return {
    children,
    wednesdayReservations,
    refetchReservations,
    userProfile,
    isDateReservedForChild,
  };
};
