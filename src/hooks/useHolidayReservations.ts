
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { HolidayReservationWithChild } from "@/types/reservations";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export const useHolidayReservations = () => {
  const queryClient = useQueryClient();

  const { data: reservations, isError, error, refetch } = useQuery({
    queryKey: ["holiday_reservations"],
    queryFn: async () => {
      console.log("A. Début de la récupération des réservations");
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

      const { data, error: reservationsError } = await supabase
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
          children:children!inner (
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
      
      if (reservationsError) {
        console.error("G. Erreur lors de la récupération des réservations:", reservationsError);
        throw reservationsError;
      }

      if (!data) {
        console.log("H. Aucune réservation trouvée");
        return [];
      }

      console.log("I. Réservations brutes reçues:", data);
      
      // Si nous avons des données, affichons la première réservation en détail
      if (data.length > 0) {
        console.log("J. Exemple détaillé de la première réservation:", JSON.stringify(data[0], null, 2));
      }

      return data as HolidayReservationWithChild[];
    },
  });

  // Configuration de la souscription en temps réel
  useEffect(() => {
    console.log("K. Mise en place de la souscription en temps réel");
    
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
          console.log('L. Changement détecté dans les réservations:', payload);
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
