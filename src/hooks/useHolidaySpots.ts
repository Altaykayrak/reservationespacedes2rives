
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

        // D'abord, vérifions manuellement les réservations pour debug
        const { data: debugReservations } = await supabase
          .from("holiday_reservations")
          .select(`
            *,
            children!inner(school_class)
          `)
          .eq("period_id", periodId)
          .eq("reservation_date", dateStr)
          .eq("status", "confirmed");

        console.log("🔍 DEBUG - Réservations trouvées pour", dateStr, ":", debugReservations?.length || 0);
        console.log("🔍 DEBUG - Détails réservations:", debugReservations);

        // Utiliser la fonction check_holiday_spots_available
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
        console.log("📊 Réservations confirmées trouvées:", debugReservations?.length || 0);
        
        return availableSpots;

      } catch (error) {
        console.error("❌ useHolidaySpots - Exception:", error);
        toast.error("Erreur lors du calcul des places disponibles");
        return null;
      }
    },
    enabled: !!periodId && !!date && !!schoolClass && !isNaN(date.getTime()),
    staleTime: 30 * 1000, // 30 secondes de cache pour forcer plus de rafraîchissement
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchOnWindowFocus: true,
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
