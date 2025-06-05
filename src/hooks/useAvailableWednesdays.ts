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

export const useAvailableWednesdays = (isKindergarten: boolean, isPrimary: boolean, isAdminMode: boolean = false) => {
  const queryClient = useQueryClient();

  // Calculer la date limite : J-1 pour admin, J-8 pour utilisateurs normaux
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Soustraire 1 jour pour admin ou 8 jours pour utilisateurs normaux
    const minWednesdayDate = new Date(today);
    const daysToSubtract = isAdminMode ? 1 : 8;
    minWednesdayDate.setDate(today.getDate() - daysToSubtract);
    
    return minWednesdayDate;
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
      const daysLabel = isAdminMode ? '(J-1)' : '(J-8)';
      console.log(`Date limite pour les réservations ${daysLabel}:`, minDate);

      // Filtrer les mercredis nuls et les dates qui sont antérieures à la date limite
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
    queryKey: ["available_wednesdays", isKindergarten, isPrimary, isAdminMode],
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
