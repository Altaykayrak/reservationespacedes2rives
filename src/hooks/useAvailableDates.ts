import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isWednesday } from "date-fns";

export const useAvailableDates = (childClass?: string) => {
  const { data: availableWednesdays } = useQuery({
    queryKey: ["availableWednesdays", childClass],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_wednesdays")
        .select(`
          *,
          wednesday_allowed_classes!inner (
            school_class
          )
        `)
        .eq("wednesday_allowed_classes.school_class", childClass || "");
      
      if (error) throw error;
      return data;
    },
    enabled: !!childClass,
  });

  const { data: availableHolidays } = useQuery({
    queryKey: ["availableHolidays", childClass],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select(`
          *,
          holiday_allowed_classes!inner (
            school_class
          )
        `)
        .eq("holiday_allowed_classes.school_class", childClass || "");
      
      if (error) throw error;
      return data;
    },
    enabled: !!childClass,
  });

  const isDateAvailable = (date: Date, childClass?: string) => {
    if (!childClass) return false;

    // Check if it's a Wednesday
    if (isWednesday(date)) {
      return availableWednesdays?.some(wednesday => 
        wednesday.date === date.toISOString().split('T')[0] &&
        wednesday.wednesday_allowed_classes.some(c => c.school_class === childClass)
      );
    }

    // Check if it's during holidays
    return availableHolidays?.some(holiday => {
      const startDate = new Date(holiday.start_date);
      const endDate = new Date(holiday.end_date);
      return (
        date >= startDate && 
        date <= endDate &&
        holiday.holiday_allowed_classes.some(c => c.school_class === childClass)
      );
    });
  };

  return {
    availableWednesdays,
    availableHolidays,
    isDateAvailable,
  };
};