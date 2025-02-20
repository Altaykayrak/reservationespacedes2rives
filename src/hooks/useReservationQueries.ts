
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
          child_id,
          created_at,
          early_dropoff,
          id,
          reservation_number,
          status,
          updated_at,
          wednesday_id,
          without_meal,
          children:children_id(
            id,
            first_name,
            last_name,
            school_class,
            profile_id,
            created_at,
            updated_at
          ),
          available_wednesdays!wednesday_reservations_wednesday_id_fkey(
            id,
            date
          )
        `)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data as unknown as (Tables<"wednesday_reservations"> & {
        children: Pick<Tables<"children">, 
          "id" | 
          "first_name" | 
          "last_name" | 
          "school_class" | 
          "profile_id" | 
          "created_at" | 
          "updated_at"
        >;
        available_wednesdays: Pick<Tables<"available_wednesdays">, "id" | "date">;
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
