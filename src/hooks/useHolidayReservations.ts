
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { HolidayReservationWithChild } from "@/types/reservations";

export const useHolidayReservations = () => {
  const queryClient = useQueryClient();

  const { data: reservations, isError, error, refetch } = useQuery({
    queryKey: ["holiday_reservations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userChildren } = await supabase
        .from("children")
        .select("id")
        .eq('profile_id', user.id);

      if (!userChildren || userChildren.length === 0) {
        return [];
      }

      const childrenIds = userChildren.map(child => child.id);

      const { data: rawReservations, error } = await supabase
        .from("holiday_reservations")
        .select(`
          *,
          children:children (
            id,
            first_name,
            last_name,
            school_class,
            profile:profiles (
              school_city
            )
          )
        `)
        .eq('status', 'confirmed')
        .in('child_id', childrenIds)
        .order('reservation_date', { ascending: true });
      
      if (error) {
        console.error("Error fetching reservations:", error);
        throw error;
      }

      if (!rawReservations) return [];

      return rawReservations.map((reservation: any) => ({
        id: reservation.id,
        child_id: reservation.child_id,
        period_id: reservation.period_id,
        reservation_date: reservation.reservation_date,
        reservation_number: reservation.reservation_number,
        without_meal: reservation.without_meal,
        early_dropoff: reservation.early_dropoff,
        status: reservation.status,
        created_at: reservation.created_at,
        updated_at: reservation.updated_at,
        children: {
          id: reservation.children.id,
          first_name: reservation.children.first_name,
          last_name: reservation.children.last_name,
          school_class: reservation.children.school_class,
          profile: {
            school_city: reservation.children.profile?.school_city || ''
          }
        }
      })) as HolidayReservationWithChild[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('holiday-reservations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'holiday_reservations'
        },
        (payload) => {
          console.log('Changement détecté dans les réservations:', payload);
          queryClient.invalidateQueries({ queryKey: ["holiday_reservations"] });
          queryClient.invalidateQueries({ queryKey: ["spots_left"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { reservations, isError, error, refetch };
};
