
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface WednesdayWithCounts {
  id: string;
  date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
  kindergartenReservations: number;
  primaryReservations: number;
  isFull: boolean;
}

export const useAvailableWednesdays = (isKindergarten: boolean, isPrimary: boolean) => {
  const queryClient = useQueryClient();

  // Calculer la date limite : mardi précédent à 23h59
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Trouver le prochain mercredi ou le mercredi actuel
    const dayOfWeek = today.getDay(); // 0 = dimanche, 3 = mercredi
    
    // Si on est mardi ou avant, on peut encore réserver pour le mercredi de cette semaine
    // Si on est mercredi ou après, on ne peut plus réserver pour ce mercredi
    let nextWednesday = new Date(today);
    
    if (dayOfWeek <= 2) { // Dimanche (0), Lundi (1), Mardi (2)
      // On peut encore réserver pour le mercredi de cette semaine
      const daysUntilWednesday = 3 - dayOfWeek;
      nextWednesday.setDate(today.getDate() + daysUntilWednesday);
    } else {
      // On est mercredi ou après, le prochain mercredi disponible est la semaine suivante
      const daysUntilNextWednesday = 10 - dayOfWeek; // 7 jours + (3 - dayOfWeek)
      nextWednesday.setDate(today.getDate() + daysUntilNextWednesday);
    }
    
    return nextWednesday;
  };

  const fetchWednesdays = async () => {
    console.log('Démarrage de la requête pour les mercredis disponibles');
    
    try {
      const wednesdaysResult = await supabase
        .from("available_wednesdays")
        .select('*')
        .order('date', { ascending: true });

      if (wednesdaysResult.error) throw wednesdaysResult.error;
      console.log('Mercredis récupérés:', wednesdaysResult.data);

      const processedWednesdays = await Promise.all(wednesdaysResult.data.map(async (wednesday) => {
        // Calculer les places restantes pour les deux catégories
        const { data: kindergartenSpots, error: kindergartenError } = await supabase
          .rpc('check_wednesday_spots_remaining', {
            wednesday_id: wednesday.id,
            child_school_class: 'MS'
          });

        const { data: primarySpots, error: primaryError } = await supabase
          .rpc('check_wednesday_spots_remaining', {
            wednesday_id: wednesday.id,
            child_school_class: 'CP'
          });

        if (kindergartenError || primaryError) {
          console.error('Erreur lors du calcul des places restantes:', kindergartenError || primaryError);
          return null;
        }

        console.log(`Places restantes maternelle pour le mercredi ${wednesday.date}:`, kindergartenSpots);
        console.log(`Places restantes primaire pour le mercredi ${wednesday.date}:`, primarySpots);

        const kindergartenReservations = wednesday.max_participants_kindergarten - (kindergartenSpots || 0);
        const primaryReservations = wednesday.max_participants_primary - (primarySpots || 0);

        return {
          id: wednesday.id,
          date: wednesday.date,
          max_participants_kindergarten: wednesday.max_participants_kindergarten,
          max_participants_primary: wednesday.max_participants_primary,
          kindergartenReservations,
          primaryReservations,
          isFull: (isKindergarten && kindergartenSpots <= 0) || (isPrimary && primarySpots <= 0)
        };
      }));

      const minDate = getMinDate();
      console.log('Date limite pour les réservations:', minDate);

      // Filtrer les mercredis nuls et les dates passées
      return processedWednesdays
        .filter(wednesday => wednesday !== null)
        .filter(wednesday => {
          const wednesdayDate = new Date(wednesday!.date);
          return wednesdayDate >= minDate;
        }) as WednesdayWithCounts[];

    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      throw error;
    }
  };

  const query = useQuery({
    queryKey: ["available_wednesdays", isKindergarten, isPrimary],
    queryFn: fetchWednesdays,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });

  // L'effet doit être déclaré après useQuery et avant tout retour conditionnel
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wednesday_reservations'
        },
        (payload) => {
          console.log('Changement détecté dans les réservations:', payload);
          queryClient.invalidateQueries({ queryKey: ["available_wednesdays"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'available_wednesdays'
        },
        (payload) => {
          console.log('Changement détecté dans les mercredis disponibles:', payload);
          queryClient.invalidateQueries({ queryKey: ["available_wednesdays"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};
