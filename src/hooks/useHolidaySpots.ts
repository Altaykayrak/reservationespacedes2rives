
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
        console.log("Skipping API call due to invalid parameters:", { periodId, date, schoolClass });
        return null;
      }

      try {
        console.log("Calling check_holiday_spots_available with:", {
          p_period_id: periodId,
          p_reservation_date: date.toISOString().split('T')[0],
          p_child_school_class: schoolClass
        });
        
        // Use the corrected SQL function with proper period-specific mappings
        const { data, error } = await supabase.rpc("check_holiday_spots_available", {
          p_period_id: periodId,
          p_reservation_date: date.toISOString().split('T')[0],
          p_child_school_class: schoolClass,
        });

        if (error) {
          console.error("Error fetching holiday spots:", error);
          toast.error("Impossible de vérifier les places disponibles");
          throw error;
        }

        console.log("Spots available response for", schoolClass, "on", date.toISOString().split('T')[0], ":", data);
        return data;
      } catch (error) {
        console.error("Exception in holidaySpots query:", error);
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
  const availableSpots = data === null ? null : Number(data);
  const isFull = availableSpots !== null && availableSpots <= 0;

  return { 
    availableSpots, 
    isFull, 
    isLoading, 
    error 
  };
};
