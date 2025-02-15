
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

      // Première requête pour obtenir les enfants et leurs school_city
      const { data: userChildren } = await supabase
        .from("children")
        .select(`
          id,
          profiles!inner (
            school_city
          )
        `)
        .eq('profile_id', user.id);

      if (!userChildren || userChildren.length === 0) {
        return [];
      }

      const childrenIds = userChildren.map(child => child.id);

      // Deuxième requête pour obtenir les réservations
      const { data: rawReservations, error } = await supabase
        .from("holiday_reservations")
        .select(`
          id,
          child_id,
          period_id,
          reservation_date,
          reservation_number,
          without_meal,
          early_dropoff,
          status,
          created_at,
          updated_at,
          children (
            id,
            first_name,
            last_name,
            school_class
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

      // Créer un map des school_city par child_id
      const schoolCityMap = userChildren.reduce((acc, child) => {
        acc[child.id] = child.profiles?.school_city || '';
        return acc;
      }, {} as Record<string, string>);

      // Construction explicite du type attendu
      const typedReservations = rawReservations.map(reservation => {
        const transformedReservation: HolidayReservationWithChild = {
          id: reservation.id,
          child_id: reservation.child_id,
          period_id: reservation.period_id,
          reservation_date: reservation.reservation_date,
          reservation_number: reservation.reservation_number,
          without_meal: reservation.without_meal ?? false,
          early_dropoff: reservation.early_dropoff ?? false,
          status: reservation.status,
          created_at: reservation.created_at,
          updated_at: reservation.updated_at,
          children: {
            id: reservation.children.id,
            first_name: reservation.children.first_name,
            last_name: reservation.children.last_name,
            school_class: reservation.children.school_class,
            profile: {
              school_city: schoolCityMap[reservation.child_id]
            }
          }
        };
        return transformedReservation;
      });

      return typedReservations;
    },
    // Ajout des options pour forcer le rechargement
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    console.log("Setting up realtime subscription for holiday reservations");
    
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
          // Forcer un refetch immédiat
          queryClient.invalidateQueries({ queryKey: ["holiday_reservations"], refetchType: 'active' });
          queryClient.invalidateQueries({ queryKey: ["spots_left"], refetchType: 'active' });
          refetch();
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [queryClient, refetch]);

  return { reservations, isError, error, refetch };
};
