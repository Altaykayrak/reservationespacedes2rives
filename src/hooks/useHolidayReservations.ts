
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

      const { data, error } = await supabase
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

      if (!data) return [];

      console.log("Raw reservations:", data);

      // Transformation des données avec vérification de type
      const transformedData = data.map(reservation => {
        const transformedReservation = { ...reservation };
        
        if (transformedReservation.children) {
          transformedReservation.children = {
            id: transformedReservation.children.id,
            first_name: transformedReservation.children.first_name,
            last_name: transformedReservation.children.last_name,
            school_class: transformedReservation.children.school_class,
            profile: {
              school_city: transformedReservation.children.profile?.school_city || ""
            }
          };
        }
        
        return transformedReservation as HolidayReservationWithChild;
      });

      console.log("Transformed reservations:", transformedData);
      return transformedData;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 30000, // Considérer les données comme périmées après 30 secondes
    gcTime: 3600000, // Remplace cacheTime qui est déprécié
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
