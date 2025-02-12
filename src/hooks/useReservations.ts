
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type WednesdayReservationWithChild = Tables<"wednesday_reservations"> & {
  children: Tables<"children">;
};

export const useReservations = () => {
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
          children (*)
        `)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as WednesdayReservationWithChild[];
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

  return {
    children,
    wednesdayReservations,
    refetchReservations,
    userProfile,
  };
};
