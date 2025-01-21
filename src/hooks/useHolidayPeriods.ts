import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useHolidayPeriods = () => {
  const { data: holidayPeriods } = useQuery({
    queryKey: ["holidayPeriods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*")
        .gte("end_date", new Date().toISOString().split("T")[0])
        .order("start_date");
      
      if (error) throw error;
      return data;
    },
  });

  return { holidayPeriods };
};