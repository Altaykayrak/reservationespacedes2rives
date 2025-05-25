
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHolidaySpots = (periodId: string, date: Date, schoolClass: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["holidaySpots", periodId, date.toISOString(), schoolClass],
    queryFn: async () => {
      if (!periodId || !date || !schoolClass || isNaN(date.getTime())) {
        console.log("🔍 useHolidaySpots - Paramètres invalides:", { periodId, date, schoolClass });
        return null;
      }

      try {
        const dateStr = date.toISOString().split('T')[0];
        
        console.log("🔄 useHolidaySpots - Appel de debug_holiday_spots_available avec:", {
          p_period_id: periodId,
          p_reservation_date: dateStr,
          p_child_school_class: schoolClass
        });

        // Appel de la fonction de débogage pour voir les détails
        const { data: debugInfo, error: debugError } = await supabase.rpc(
          'debug_holiday_spots_available',
          {
            p_period_id: periodId,
            p_reservation_date: dateStr,
            p_child_school_class: schoolClass
          }
        );

        if (debugError) {
          console.error("❌ Erreur RPC debug_holiday_spots_available:", debugError);
          toast.error("Erreur lors du debug des places disponibles");
          return null;
        }

        console.log("🔍 DEBUG - Informations détaillées du calcul:", debugInfo);

        // Retourner le nombre de places disponibles calculé
        return debugInfo?.available_spots || 0;

      } catch (error) {
        console.error("❌ useHolidaySpots - Exception:", error);
        toast.error("Erreur lors du calcul des places disponibles");
        return null;
      }
    },
    enabled: !!periodId && !!date && !!schoolClass && !isNaN(date.getTime()),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  const availableSpots = data;
  const isFull = availableSpots !== null && availableSpots <= 0;

  console.log("🎯 useHolidaySpots - Résultat final du hook:", { 
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
