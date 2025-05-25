
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
        
        console.log("🔄 useHolidaySpots - Appel de check_holiday_spots_available avec:", {
          p_period_id: periodId,
          p_reservation_date: dateStr,
          p_child_school_class: schoolClass
        });

        // Appel direct de la fonction Supabase qui retourne le nombre de places disponibles
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

        console.log("✅ useHolidaySpots - Résultat brut de la fonction RPC:", {
          availableSpots,
          type: typeof availableSpots,
          periodId,
          date: dateStr,
          schoolClass
        });

        // La fonction retourne directement un nombre entier
        const spots = typeof availableSpots === 'number' ? availableSpots : parseInt(availableSpots) || 0;
        
        console.log("✅ useHolidaySpots - Places disponibles finales:", {
          spots,
          original: availableSpots,
          periodId,
          date: dateStr,
          schoolClass
        });

        return spots;

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
