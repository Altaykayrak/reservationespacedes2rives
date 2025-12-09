
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

  // Calculer la date limite : J+1 pour admin, J-15 (mardi à 18h) pour utilisateurs normaux
  const getMinDate = () => {
    if (isAdminMode) {
      // Admin : peut réserver jusqu'à J+1
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    // Utilisateurs normaux : règle des 15 jours avant le mercredi, deadline mardi à 15h
    const now = new Date();
    
    // Pour chaque mercredi, la deadline est le mardi J-15 à 15h00
    // On calcule la date minimale de mercredi réservable
    // Si nous sommes après mardi 15h, le mercredi dans 15 jours n'est plus réservable
    
    // Trouver le prochain mardi à 15h (ou le mardi courant si on est avant 15h)
    const currentDay = now.getDay(); // 0=dimanche, 1=lundi, 2=mardi, ...
    const currentHour = now.getHours();
    
    // Calculer le nombre de jours jusqu'au prochain mardi
    let daysUntilTuesday = (2 - currentDay + 7) % 7;
    
    // Si on est mardi
    if (currentDay === 2) {
      // Si on est après 18h, on a passé la deadline de ce mardi
      if (currentHour >= 18) {
        daysUntilTuesday = 7; // Prochain mardi
      } else {
        daysUntilTuesday = 0; // Mardi courant, deadline pas encore passée
      }
    }
    
    // Le mercredi réservable minimum est 15 jours après le mardi de deadline
    // Deadline mardi → mercredi J+15 (le lendemain + 14 jours = 15 jours après)
    const nextDeadlineTuesday = new Date(now);
    nextDeadlineTuesday.setHours(0, 0, 0, 0);
    nextDeadlineTuesday.setDate(now.getDate() + daysUntilTuesday);
    
    // Le mercredi minimum réservable est 15 jours après ce mardi
    // Mardi + 15 jours = mercredi de la semaine suivante + 2 semaines
    const minWednesday = new Date(nextDeadlineTuesday);
    minWednesday.setDate(nextDeadlineTuesday.getDate() + 15);
    
    return minWednesday;
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
      const daysLabel = isAdminMode ? '(J+1)' : '(deadline mardi J-15 à 18h)';
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
