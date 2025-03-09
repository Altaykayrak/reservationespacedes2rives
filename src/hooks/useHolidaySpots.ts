
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useEffect } from "react";
import { normalizeSchoolClass } from "@/utils/schoolClassUtils";

export const useHolidaySpots = (
  periodId: string,
  date: Date,
  childSchoolClass: string
) => {
  const queryClient = useQueryClient();
  const normalizedClass = normalizeSchoolClass(childSchoolClass);

  // Logging spécifique pour le debug du Club Ado
  console.log(`useHolidaySpots - Input: Class=${childSchoolClass}, Normalized=${normalizedClass}, Date=${format(date, "yyyy-MM-dd")}, PeriodId=${periodId}`);

  useEffect(() => {
    const channel = supabase
      .channel('holiday-spots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'holiday_reservations'
        },
        (payload) => {
          console.log("Holiday reservation change detected:", payload);
          queryClient.invalidateQueries({
            queryKey: ["spots_left", periodId, date.toISOString(), normalizedClass]
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, periodId, date, normalizedClass]);

  return useQuery({
    queryKey: ["spots_left", periodId, date.toISOString(), normalizedClass],
    queryFn: async () => {
      if (!normalizedClass) {
        console.error("Classe scolaire manquante");
        return null;
      }

      if (!periodId) {
        console.error("Period ID manquant");
        return null;
      }

      const formattedDate = format(date, 'yyyy-MM-dd');
      
      console.log("Appel à check_holiday_spots_available avec:", {
        period_id: periodId,
        reservation_date: formattedDate,
        child_school_class: normalizedClass
      });

      try {
        // Récupérer d'abord la période pour obtenir le max spécifique
        const { data: period, error: periodError } = await supabase
          .from('available_holiday_periods')
          .select('max_participants_kindergarten, max_participants_primary, max_participants_teen')
          .eq('id', periodId)
          .single();
          
        if (periodError) {
          console.error("Erreur lors de la récupération de la période:", periodError);
          throw periodError;
        }
        
        console.log("Période récupérée:", period);
        
        // Appel à la fonction RPC pour vérifier les places disponibles
        const { data: spotCount, error } = await supabase
          .rpc('check_holiday_spots_available', {
            period_id: periodId,
            reservation_date: formattedDate,
            child_school_class: normalizedClass
          });

        if (error) {
          console.error("Erreur avec les paramètres:", {
            period_id: periodId,
            reservation_date: formattedDate,
            child_school_class: normalizedClass
          });
          console.error("Erreur retournée:", error);
          throw error;
        }

        console.log(`Résultat de la requête pour ${normalizedClass} le ${formattedDate}:`, spotCount);
        
        // Vérification complète du résultat pour éviter les faux négatifs
        console.log(`Résultat détaillé: valeur=${spotCount}, type=${typeof spotCount}, null?=${spotCount === null}, undefined?=${spotCount === undefined}, est zéro?=${spotCount === 0}`);
        
        // Forcer un type de retour cohérent
        if (typeof spotCount === 'number') {
          // Si le nombre est négatif (ce qui serait une erreur de calcul), on considère qu'il n'y a pas de place
          return spotCount < 0 ? 0 : spotCount;
        }
        
        // Si spotCount n'est pas un nombre, on retourne null
        return null;
      } catch (error) {
        console.error("Erreur lors de la vérification des places:", error);
        throw error;
      }
    },
    enabled: Boolean(periodId) && Boolean(normalizedClass),
    retry: 1,
    retryDelay: 1000,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
};
