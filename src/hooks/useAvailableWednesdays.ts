
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

  const { data: childInfo } = useQuery({
    queryKey: ["selectedChild"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("school_class")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

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
        // Utiliser la nouvelle fonction RPC pour obtenir les places restantes
        const { data: spotsLeft, error } = await supabase
          .rpc('check_wednesday_spots_remaining', {
            wednesday_id: wednesday.id,
            child_school_class: childInfo?.school_class || (isKindergarten ? 'MS' : 'CP')
          });

        if (error) {
          console.error('Erreur lors du calcul des places restantes:', error);
          return null;
        }

        console.log(`Places restantes pour le mercredi ${wednesday.date}:`, spotsLeft);

        const isKindergartenClass = childInfo?.school_class && ["PS", "MS", "GS", "Petite Section", "Moyenne Section", "Grande Section"].includes(childInfo.school_class);
        const maxSpots = isKindergartenClass ? wednesday.max_participants_kindergarten : wednesday.max_participants_primary;

        return {
          id: wednesday.id,
          date: wednesday.date,
          max_participants_kindergarten: wednesday.max_participants_kindergarten,
          max_participants_primary: wednesday.max_participants_primary,
          kindergartenReservations: isKindergartenClass ? maxSpots - spotsLeft : 0,
          primaryReservations: !isKindergartenClass ? maxSpots - spotsLeft : 0,
          isFull: spotsLeft <= 0
        };
      }));

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
    queryKey: ["available_wednesdays", childInfo?.school_class],
    queryFn: fetchWednesdays,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !!childInfo?.school_class
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
