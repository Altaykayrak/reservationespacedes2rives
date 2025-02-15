
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { HolidayReservationWithChild } from "@/types/reservations";

export const useHolidayReservations = () => {
  const queryClient = useQueryClient();

  const { data: reservations, isError, error, refetch } = useQuery({
    queryKey: ["holiday_reservations"],
    queryFn: async () => {
      console.log("Fetching holiday reservations...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Première requête pour obtenir les enfants et leurs school_city
      const { data: userChildren } = await supabase
        .from("children")
        .select(`
          id,
          profile:profiles!inner (
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
            school_class,
            profile:profiles!inner (
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

      console.log("Raw reservations:", rawReservations);

      // Construction explicite du type attendu avec vérification du type
      const typedReservations: HolidayReservationWithChild[] = rawReservations.map(reservation => ({
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
            school_city: reservation.children.profile?.school_city || ''
          }
        }
      }));

      console.log("Transformed reservations:", typedReservations);
      return typedReservations;
    },
    staleTime: 1000, // Données périmées après 1 seconde
    gcTime: 0, // Pas de mise en cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
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
        async (payload) => {
          console.log('Changement détecté dans les réservations:', payload);
          // Invalider et recharger immédiatement les queries
          await queryClient.invalidateQueries({ 
            queryKey: ["holiday_reservations"],
            exact: true,
            refetchType: 'all'
          });
          await queryClient.invalidateQueries({ 
            queryKey: ["spots_left"],
            exact: true,
            refetchType: 'all'
          });
          await refetch({ throwOnError: true });
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
