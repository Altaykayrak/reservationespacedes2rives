
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addHours } from "date-fns";
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = addHours(today, 72);

  const fetchWednesdays = async () => {
    console.log('Démarrage de la requête pour les mercredis disponibles');
    
    try {
      const wednesdaysResult = await supabase
        .from("available_wednesdays")
        .select('*')
        .order('date', { ascending: true });

      if (wednesdaysResult.error) throw wednesdaysResult.error;
      console.log('Mercredis récupérés:', wednesdaysResult.data);

      const reservationsResult = await supabase
        .from("wednesday_reservations")
        .select(`
          id,
          wednesday_id,
          status,
          children (
            id,
            first_name,
            last_name,
            school_class
          )
        `)
        .eq('status', 'confirmed');

      if (reservationsResult.error) throw reservationsResult.error;
      const confirmedReservations = reservationsResult.data.filter(r => r.children !== null);
      console.log('Réservations confirmées filtrées:', confirmedReservations);

      const processedWednesdays = wednesdaysResult.data.map(wednesday => {
        // Filtrer les réservations pour ce mercredi spécifique
        const wednesdayReservations = confirmedReservations.filter(reservation => 
          reservation.wednesday_id === wednesday.id
        );

        console.log(`Réservations pour le mercredi ${wednesday.date}:`, wednesdayReservations);

        // Compter les réservations par type
        const kindergartenCount = wednesdayReservations.filter(reservation => 
          ["PS", "MS", "GS"].includes(reservation.children.school_class)
        ).length;

        const primaryCount = wednesdayReservations.filter(reservation => 
          ["CP", "CE1", "CE2", "CM1", "CM2"].includes(reservation.children.school_class)
        ).length;

        console.log(`Décompte pour le mercredi ${wednesday.date}:`, {
          maternelle: kindergartenCount,
          primaire: primaryCount,
          total_reservations: wednesdayReservations.length
        });

        return {
          id: wednesday.id,
          date: wednesday.date,
          max_participants_kindergarten: wednesday.max_participants_kindergarten,
          max_participants_primary: wednesday.max_participants_primary,
          kindergartenReservations: kindergartenCount,
          primaryReservations: primaryCount,
          isFull: isKindergarten 
            ? kindergartenCount >= wednesday.max_participants_kindergarten
            : primaryCount >= wednesday.max_participants_primary
        };
      }).filter(wednesday => {
        const wednesdayDate = new Date(wednesday.date);
        return wednesdayDate >= minDate;
      });

      return processedWednesdays;
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      throw error;
    }
  };

  const query = useQuery({
    queryKey: ["available_wednesdays"],
    queryFn: fetchWednesdays,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

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
