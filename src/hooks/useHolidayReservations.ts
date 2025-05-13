
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { HolidayReservationWithChild } from "@/types/reservations";
import { useToast } from "@/hooks/use-toast";

export const useHolidayReservations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reservations, isError, error, refetch } = useQuery({
    queryKey: ["holiday_reservations"],
    queryFn: async () => {
      console.log("Début de la récupération des réservations de vacances");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("Aucun utilisateur connecté");
        throw new Error("Not authenticated");
      }

      const { data: userChildren, error: childrenError } = await supabase
        .from("children")
        .select("id")
        .eq('profile_id', user.id);

      if (childrenError) {
        console.error("Erreur lors de la récupération des enfants:", childrenError);
        throw childrenError;
      }

      if (!userChildren || userChildren.length === 0) {
        console.log("Aucun enfant trouvé pour l'utilisateur");
        return [];
      }

      const childrenIds = userChildren.map(child => child.id);

      // Récupération simplifiée des réservations
      const { data: reservationsData, error: reservationsError } = await supabase
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
            profile_id
          )
        `)
        .eq('status', 'confirmed')
        .in('child_id', childrenIds)
        .order('reservation_date', { ascending: true });

      if (reservationsError) {
        console.error("Erreur lors de la récupération des réservations:", reservationsError);
        throw reservationsError;
      }

      if (!reservationsData) {
        console.log("Aucune réservation trouvée");
        return [];
      }

      console.log("Réservations brutes reçues:", reservationsData.length);

      // Transformer les données pour correspondre à notre structure attendue
      const transformedReservations = reservationsData
        .filter(reservation => reservation.children) // Vérifier que les données enfant existent
        .map(reservation => {
          const childData = reservation.children;

          return {
            id: reservation.id,
            child_id: reservation.child_id,
            period_id: reservation.period_id,
            reservation_date: reservation.reservation_date,
            reservation_number: reservation.reservation_number,
            without_meal: reservation.without_meal || false,
            early_dropoff: reservation.early_dropoff || false,
            status: reservation.status,
            created_at: reservation.created_at,
            updated_at: reservation.updated_at,
            children: {
              id: childData.id,
              first_name: childData.first_name,
              last_name: childData.last_name,
              school_class: childData.school_class,
              profile: {
                school_city: '' // Champ requis par le type
              }
            }
          } as HolidayReservationWithChild;
        });

      console.log("Nombre de réservations transformées:", transformedReservations.length);
      return transformedReservations;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Configuration de la souscription en temps réel
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { reservations, isError, error, refetch };
};
