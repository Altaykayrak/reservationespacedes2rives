
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Translation function for school class categories
const translateCategoryForDatabase = (schoolClass: string): string => {
  // Normalize the input to handle case variations
  const normalizedClass = schoolClass.trim().toUpperCase();
  
  // Match category patterns
  if (["PS", "MS", "GS", "PETITE SECTION", "MOYENNE SECTION", "GRANDE SECTION"].includes(normalizedClass)) {
    return "kindergarten";
  } else if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(normalizedClass)) {
    return "primary";
  } else if (["6EME", "6ÈME", "5EME", "5ÈME", "4EME", "4ÈME", "3EME", "3ÈME", 
              "SECONDE", "PREMIERE", "PREMIÈRE", "TERMINALE"].includes(normalizedClass)) {
    return "teen";
  }
  
  // Default to teen for other cases
  console.log(`Category not explicitly mapped for class: ${schoolClass}, defaulting to teen`);
  return "teen";
};

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
        // Translate the schoolClass to the format expected by the database
        const databaseCategory = translateCategoryForDatabase(schoolClass);
        
        console.log("Calling check_holiday_spots_available with:", {
          period_id: periodId,
          reservation_date: date.toISOString().split('T')[0],
          child_school_class: schoolClass,
          translated_category: databaseCategory
        });
        
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
