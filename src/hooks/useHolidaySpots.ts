
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
        
        console.log("🔄 useHolidaySpots - Calcul des places pour:", {
          periodId,
          date: dateStr,
          schoolClass
        });

        // Utiliser la fonction Supabase mise à jour qui applique les bonnes règles
        const { data: availableSpots, error: spotsError } = await supabase.rpc(
          'check_holiday_spots_available',
          {
            p_period_id: periodId,
            p_reservation_date: dateStr,
            p_child_school_class: schoolClass
          }
        );

        if (spotsError) {
          console.error("❌ Erreur lors du calcul des places:", spotsError);
          toast.error("Erreur lors du calcul des places disponibles");
          return null;
        }

        console.log("✅ useHolidaySpots - Places disponibles calculées:", {
          periodId,
          date: dateStr,
          schoolClass,
          availableSpots
        });

        return availableSpots;

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
