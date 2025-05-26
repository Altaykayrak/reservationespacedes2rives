
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
        
        console.log("🔄 useHolidaySpots - Calcul des places disponibles pour:", {
          periodId,
          date: dateStr,
          schoolClass
        });

        // Utiliser directement la fonction RPC qui gère correctement le typage et la logique
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
          // Ne pas afficher d'erreur toast pour les utilisateurs normaux, juste logger
          console.warn("Impossible de calculer les places disponibles, cela peut être normal pour certains utilisateurs");
          return null;
        }

        console.log("🎯 Places restantes calculées via RPC:", {
          classeEnfant: schoolClass,
          placesRestantes: availableSpots,
          date: dateStr,
          periodId
        });

        return availableSpots;

      } catch (error) {
        console.error("❌ useHolidaySpots - Exception:", error);
        // Ne pas afficher d'erreur toast, juste logger
        console.warn("Erreur lors du calcul des places disponibles");
        return null;
      }
    },
    enabled: !!periodId && !!date && !!schoolClass && !isNaN(date.getTime()),
    staleTime: 30 * 1000, // 30 secondes de cache
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
