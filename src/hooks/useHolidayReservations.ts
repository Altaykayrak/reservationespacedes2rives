
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
      console.log("A. Début de la récupération des réservations de vacances");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("B. Aucun utilisateur connecté");
        throw new Error("Not authenticated");
      }

      console.log("C. Utilisateur connecté:", user.id);

      const { data: userChildren, error: childrenError } = await supabase
        .from("children")
        .select("id")
        .eq('profile_id', user.id);

      if (childrenError) {
        console.error("D. Erreur lors de la récupération des enfants:", childrenError);
        throw childrenError;
      }

      if (!userChildren || userChildren.length === 0) {
        console.log("E. Aucun enfant trouvé pour l'utilisateur");
        return [];
      }

      console.log("F. Enfants trouvés:", userChildren);

      const childrenIds = userChildren.map(child => child.id);

      // Ensure we're only getting confirmed reservations
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
            profile_id,
            profile (
              school_city
            )
          )
        `)
        .eq('status', 'confirmed')
        .in('child_id', childrenIds)
        .order('reservation_date', { ascending: true });

      if (reservationsError) {
        console.error("G. Erreur lors de la récupération des réservations:", reservationsError);
        throw reservationsError;
      }

      if (!reservationsData) {
        console.log("H. Aucune réservation trouvée");
        return [];
      }

      console.log("I. Réservations brutes reçues:", JSON.stringify(reservationsData, null, 2));

      // Transform the data to match our expected structure
      const transformedReservations = reservationsData.map(reservation => {
        console.log("Traitement de la réservation:", reservation.id);
        
        if (!reservation.children) {
          console.error("Données enfant manquantes pour la réservation:", reservation.id);
          return null;
        }

        // Ensure we're handling the children data correctly
        const childData = reservation.children;

        const transformedReservation: HolidayReservationWithChild = {
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
              school_city: childData.profile?.school_city || ''
            }
          }
        };
        
        console.log("Réservation transformée:", JSON.stringify(transformedReservation, null, 2));
        return transformedReservation;
      }).filter((r): r is HolidayReservationWithChild => r !== null);

      console.log("J. Nombre de réservations transformées:", transformedReservations.length);
      return transformedReservations;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    console.log("K. Configuration de la souscription en temps réel");
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
          console.log('L. Changement détecté:', payload);
          queryClient.invalidateQueries({ queryKey: ["holiday_reservations"] });
        }
      )
      .subscribe();

    return () => {
      console.log("M. Nettoyage de la souscription");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { reservations, isError, error, refetch };
};
