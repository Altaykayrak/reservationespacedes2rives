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

  const { data: reservations, refetch: refetchReservations } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          children (
            first_name,
            last_name,
            school_class
          )
        `)
        .order('reservation_date', { ascending: true });
      
      if (error) throw error;
      return data as (Tables<"reservations"> & {
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
    if (!reservations) return false;
    
    return reservations.some(
      (reservation) => 
        reservation.child_id === childId && 
        reservation.reservation_date === format(date, "yyyy-MM-dd")
    );
  };

  return {
    children,
    reservations,
    refetchReservations,
    userProfile,
    isDateReservedForChild,
  };
};