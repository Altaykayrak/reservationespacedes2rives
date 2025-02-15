
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { DatabaseHolidayReservation, HolidayReservationWithChild } from "@/types/reservations";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export const useHolidayReservations = () => {
  const queryClient = useQueryClient();

  const { data: reservations, isError, error, refetch } = useQuery({
    queryKey: ["holiday_reservations"],
    queryFn: async () => {
      console.log("Fetching holiday reservations...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Première requête pour obtenir les enfants de l'utilisateur
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
          children (
            *,
            profile:profiles(*)
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
      const typedReservations: HolidayReservationWithChild[] = (rawReservations as DatabaseHolidayReservation[]).map(reservation => ({
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
            school_city: reservation.children.profile.school_city
          }
        }
      }));

      console.log("Transformed reservations:", typedReservations);
      return typedReservations;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 30000, // Considérer les données comme périmées après 30 secondes
    cacheTime: 3600000, // Garder les données en cache pendant 1 heure
    retry: 3, // Réessayer 3 fois en cas d'échec
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponentiel
  });

  // Configuration de la souscription en temps réel
  useEffect(() => {
    console.log("Setting up realtime subscription for holiday reservations");
    
    const handleRealtimeChanges = (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
      console.log('Change detected in holiday reservations:', payload);
      
      // Invalider le cache et forcer un refetch
      queryClient.invalidateQueries({
        queryKey: ["holiday_reservations"],
      });
    };
    
    const channel = supabase
      .channel('holiday-reservations-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Écouter tous les types d'événements
          schema: 'public',
          table: 'holiday_reservations'
        },
        handleRealtimeChanges
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to holiday reservations changes");
        } else if (status === 'CHANNEL_ERROR') {
          console.error("Error subscribing to holiday reservations changes");
          // Réessayer de se connecter après un délai
          setTimeout(() => {
            channel.subscribe();
          }, 5000);
        }
      });

    // Cleanup function
    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [queryClient]); // Dépendance uniquement sur queryClient puisque nous utilisons invalidateQueries

  return { 
    reservations, 
    isError, 
    error, 
    refetch,
    // Ajouter une fonction de rafraîchissement explicite
    forceRefresh: () => queryClient.invalidateQueries({ queryKey: ["holiday_reservations"] })
  };
};
