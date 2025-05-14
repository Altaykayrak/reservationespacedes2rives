
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useHolidaySpots = (periodId: string, date: Date, schoolClass: string) => {
  // Use React Query for data fetching
  const { data, isLoading, error } = useQuery({
    queryKey: ["holidaySpots", periodId, date.toISOString(), schoolClass],
    queryFn: async () => {
      // Skip API call if any required parameter is missing or invalid
      if (!periodId || !date || !schoolClass || isNaN(date.getTime())) {
        console.log("Skipping API call due to invalid parameters:", { periodId, date, schoolClass });
        return null;
      }

      try {
        console.log("Calling check_holiday_spots_available with:", {
          period_id: periodId,
          reservation_date: date.toISOString().split('T')[0],
          child_school_class: schoolClass
        });
        
        const { data, error } = await supabase.rpc("check_holiday_spots_available", {
          period_id: periodId,
          reservation_date: date.toISOString().split('T')[0],
          child_school_class: schoolClass,
        });

        if (error) {
          console.error("Error fetching holiday spots:", error);
          toast({
            title: "Erreur",
            description: "Impossible de vérifier les places disponibles",
            variant: "destructive"
          });
          throw error;
        }

        console.log("Spots available response:", data);
        // Ensure we're returning a number or null
        return typeof data === 'number' ? data : null;
      } catch (error) {
        console.error("Exception in holidaySpots query:", error);
        return null;
      }
    },
    // Enable the query only when we have valid parameters
    enabled: !!periodId && !!date && !!schoolClass && !isNaN(date.getTime()),
  });

  // Ensure availableSpots is a number or null for type safety
  const availableSpots = typeof data === 'number' ? data : null;
  const isFull = availableSpots !== null && availableSpots <= 0;

  return { 
    availableSpots, 
    isFull, 
    isLoading, 
    error 
  };
};
