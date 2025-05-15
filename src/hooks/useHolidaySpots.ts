
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { schoolClassToDbCategory } from "@/utils/categoryTranslationUtils";

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
        // Translate the schoolClass to the database category format
        const databaseCategory = schoolClassToDbCategory(schoolClass);
        
        console.log("Calling check_holiday_spots_available with:", {
          period_id: periodId,
          reservation_date: date.toISOString().split('T')[0],
          child_school_class: schoolClass,
          translated_category: databaseCategory
        });
        
        // Use the original parameter names here, even though the SQL function
        // uses 'p_' prefixed names. Supabase handles the mapping internally.
        const { data, error } = await supabase.rpc("check_holiday_spots_available", {
          period_id: periodId,
          reservation_date: date.toISOString().split('T')[0],
          child_school_class: schoolClass,
        });

        if (error) {
          console.error("Error fetching holiday spots:", error);
          toast.error("Impossible de vérifier les places disponibles");
          throw error;
        }

        console.log("Spots available response:", data);
        return data;
      } catch (error) {
        console.error("Exception in holidaySpots query:", error);
        return null;
      }
    },
    // Enable the query only when we have valid parameters
    enabled: !!periodId && !!date && !!schoolClass && !isNaN(date.getTime()),
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
