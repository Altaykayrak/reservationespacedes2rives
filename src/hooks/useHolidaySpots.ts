
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

        // 1. Récupérer les informations de la période et déterminer le groupe
        const { data: periodData, error: periodError } = await supabase
          .from("available_holiday_periods")
          .select("max_participants_kindergarten, max_participants_primary, max_participants_teen")
          .eq("id", periodId)
          .single();

        if (periodError) {
          console.error("❌ Erreur lors de la récupération de la période:", periodError);
          toast.error("Erreur lors de la récupération de la période");
          return null;
        }

        // 2. Déterminer le groupe de la classe
        const { data: classGroup, error: groupError } = await supabase.rpc(
          'get_school_class_group_for_period',
          {
            p_period_id: periodId,
            p_school_class: schoolClass
          }
        );

        if (groupError) {
          console.error("❌ Erreur lors de la détermination du groupe:", groupError);
          toast.error("Erreur lors de la détermination du groupe");
          return null;
        }

        console.log("✅ Groupe déterminé:", classGroup);

        // 3. Récupérer la capacité selon le groupe
        let capacity = 0;
        if (classGroup === 'kindergarten') {
          capacity = periodData.max_participants_kindergarten;
        } else if (classGroup === 'primary') {
          capacity = periodData.max_participants_primary;
        } else if (classGroup === 'teen') {
          capacity = periodData.max_participants_teen;
        }

        console.log("📦 Capacité pour le groupe", classGroup, ":", capacity);

        // 4. Utiliser la fonction RPC pour compter les réservations du même groupe
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

        console.log("🎯 Calcul final via RPC:", {
          groupe: classGroup,
          capacite: capacity,
          placesRestantes: availableSpots,
          date: dateStr,
          classeEnfant: schoolClass
        });

        return availableSpots;

      } catch (error) {
        console.error("❌ useHolidaySpots - Exception:", error);
        toast.error("Erreur lors du calcul des places disponibles");
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
