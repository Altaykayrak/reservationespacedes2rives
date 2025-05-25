
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHolidaySpots = (periodId: string, date: Date, schoolClass: string) => {
  // Use React Query for data fetching with improved cache management
  const { data, isLoading, error } = useQuery({
    queryKey: ["holidaySpots", periodId, date.toISOString(), schoolClass],
    queryFn: async () => {
      // Skip API call if any required parameter is missing or invalid
      if (!periodId || !date || !schoolClass || isNaN(date.getTime())) {
        console.log("🔍 useHolidaySpots - Paramètres invalides:", { periodId, date, schoolClass });
        return null;
      }

      try {
        const dateStr = date.toISOString().split('T')[0];
        
        console.log("🔄 useHolidaySpots - Appel check_holiday_spots_available avec:", {
          p_period_id: periodId,
          p_reservation_date: dateStr,
          p_child_school_class: schoolClass
        });
        
        // Première vérification : compter les réservations directement pour cette date/période
        console.log("🔍 DEBUG useHolidaySpots - Vérification directe des réservations pour debug:");
        const { data: debugReservations, error: debugError } = await supabase
          .from("holiday_reservations")
          .select(`
            id,
            child_id,
            reservation_date,
            status,
            children:child_id (
              id,
              school_class
            )
          `)
          .eq("period_id", periodId)
          .eq("reservation_date", dateStr)
          .eq("status", "confirmed");
          
        if (debugError) {
          console.error("❌ DEBUG useHolidaySpots - Erreur lors de la vérification directe:", debugError);
        } else {
          console.log("📊 DEBUG useHolidaySpots - Réservations trouvées directement:", debugReservations);
          console.log("📊 DEBUG useHolidaySpots - Nombre total de réservations confirmées pour cette date:", debugReservations?.length || 0);
          
          // Filtrer par classe pour voir combien correspondent au groupe
          const reservationsForClass = debugReservations?.filter(res => {
            const childClass = (res.children as any)?.school_class;
            console.log("📊 DEBUG useHolidaySpots - Enfant classe:", childClass, "recherchée:", schoolClass);
            return childClass && childClass.toLowerCase() === schoolClass.toLowerCase();
          }) || [];
          
          console.log("📊 DEBUG useHolidaySpots - Réservations pour la classe", schoolClass, ":", reservationsForClass.length);
        }
        
        // Use the corrected SQL function with proper period-specific mappings
        const { data, error } = await supabase.rpc("check_holiday_spots_available", {
          p_period_id: periodId,
          p_reservation_date: dateStr,
          p_child_school_class: schoolClass,
        });

        if (error) {
          console.error("❌ useHolidaySpots - Erreur SQL:", error);
          toast.error("Impossible de vérifier les places disponibles");
          throw error;
        }

        console.log("✅ useHolidaySpots - Places disponibles pour", schoolClass, "le", dateStr, ":", data);
        
        // Ensure we return a valid number or null
        const result = data !== null && data !== undefined ? Number(data) : null;
        if (result !== null && isNaN(result)) {
          console.error("❌ useHolidaySpots - Données invalides reçues:", data, "type:", typeof data);
          return null;
        }
        
        return result;
      } catch (error) {
        console.error("❌ useHolidaySpots - Exception:", error);
        return null;
      }
    },
    // Enable the query only when we have valid parameters
    enabled: !!periodId && !!date && !!schoolClass && !isNaN(date.getTime()),
    // Reduce cache time to ensure fresh data
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  // Ensure availableSpots is a number (can be 0) or null for type safety
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
