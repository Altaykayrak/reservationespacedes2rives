
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

        console.log("Résultat de la requête:", spotCount);
        return spotCount;
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
