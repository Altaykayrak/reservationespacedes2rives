
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useHolidaySpots = (periodId: string, date: Date, schoolClass: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["holidaySpots", periodId, date.toISOString(), schoolClass],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("check_holiday_spots_available", {
        period_id: periodId,
        reservation_date: date.toISOString().split('T')[0],
        child_school_class: schoolClass,
      });

      if (error) {
        console.error("Error fetching holiday spots:", error);
        throw error;
      }

      return data || 0;
    },
    enabled: !!periodId && !!date && !!schoolClass,
  });

  // Ensure data is a number for type safety
  const availableSpots = typeof data === 'number' ? data : null;
  const isFull = availableSpots !== null && availableSpots <= 0;

  return { 
    availableSpots, 
    isFull, 
    isLoading, 
    error 
  };
};
