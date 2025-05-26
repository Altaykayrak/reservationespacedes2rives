
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHolidaySpots = (periodId: string, date: Date, schoolClass: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["holidaySpots", periodId, date.toISOString().split('T')[0], schoolClass],
    queryFn: async () => {
      if (!periodId || !date || !schoolClass || isNaN(date.getTime())) {
        console.log("🔍 useHolidaySpots - Paramètres invalides:", { periodId, date, schoolClass });
        return null;
      }

      try {
        const dateStr = date.toISOString().split('T')[0];
        
        console.log("🔄 useHolidaySpots - Appel de check_holiday_spots_available avec:", {
          p_period_id: periodId,
          p_reservation_date: dateStr,
          p_child_school_class: schoolClass
        });

        // Utiliser directement la fonction check_holiday_spots_available qui retourne le nombre de places
        const { data: availableSpots, error: spotsError } = await supabase.rpc(
          'check_holiday_spots_available',
          {
            p_period_id: periodId,
            p_reservation_date: dateStr,
            p_child_school_class: schoolClass
          }
        );

        if (spotsError) {
          console.error("❌ Erreur RPC check_holiday_spots_available:", spotsError);
          toast.error("Erreur lors du calcul des places disponibles");
          return null;
        }

        console.log("✅ Places disponibles calculées:", availableSpots, "pour", schoolClass, "le", dateStr);
        return availableSpots;

      } catch (error) {
        console.error("❌ useHolidaySpots - Exception:", error);
        toast.error("Erreur lors du calcul des places disponibles");
        return null;
      }
    },
    enabled: !!periodId && !!date && !!schoolClass && !isNaN(date.getTime()),
    staleTime: 60 * 1000, // 1 minute de cache
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Réduire les tentatives
    refetchOnWindowFocus: false, // Éviter les appels inutiles
  });

  const availableSpots = data;
  const isFull = availableSpots !== null && availableSpots <= 0;

  console.log("🎯 useHolidaySpots - Résultat final:", { 
    availableSpots, 
    isFull, 
    isLoading, 
    periodId, 
    schoolClass,
    date: date.toISOString().split('T')[0]
  });

  return { 
    availableSpots, 
    isFull, 
    isLoading, 
    error 
  };
};
