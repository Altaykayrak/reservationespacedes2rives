
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHolidaySpots = (periodId: string, date: Date, schoolClass: string) => {
  // Générer une clé stable pour la date, même si Date est un objet
  const dateString = date instanceof Date && !isNaN(date.getTime()) 
    ? date.toISOString().split('T')[0]
    : null;

  // Use React Query for data fetching with proper caching
  const { data, isLoading, error } = useQuery({
    // Utiliser un tableau stable pour la queryKey
    queryKey: ["holidaySpots", periodId, dateString, schoolClass],
    queryFn: async () => {
      // Skip API call if any required parameter is missing or invalid
      if (!periodId || !dateString || !schoolClass) {
        return null;
      }

      try {
        const { data, error } = await supabase.rpc("check_holiday_spots_available", {
          period_id: periodId,
          reservation_date: dateString,
          child_school_class: schoolClass,
        });

        if (error) {
          console.error("Error fetching holiday spots:", error);
          toast("Impossible de vérifier les places disponibles", {
            description: "Une erreur est survenue"
          });
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Exception in holidaySpots query:", error);
        return null;
      }
    },
    // Enable the query only when we have valid parameters
    enabled: !!periodId && !!dateString && !!schoolClass,
    // Ajouter un temps de cache de 5 minutes pour éviter les requêtes inutiles
    staleTime: 5 * 60 * 1000,
    // Ne pas refetch automatiquement, seulement quand les paramètres changent
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Ensure availableSpots is a number (can be 0) or null for type safety
  const availableSpots = data === null ? null : Number(data);
  const isFull = availableSpots !== null && availableSpots <= 0;

  return { 
    availableSpots, 
    isFull, 
    isLoading, 
    error 
  };
};
