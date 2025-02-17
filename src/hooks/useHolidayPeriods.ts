
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useHolidayPeriods = () => {
  const { data: holidayPeriods } = useQuery({
    queryKey: ["holidayPeriods"],
    queryFn: async () => {
      console.log("Fetching holiday periods...");
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*")
        .gte("end_date", new Date().toISOString().split("T")[0])
        .order("start_date");
      
      if (error) {
        console.error("Error fetching holiday periods:", error);
        throw error;
      }
      console.log("Retrieved holiday periods:", data);
      return data;
    },
  });

  return { holidayPeriods };
};
