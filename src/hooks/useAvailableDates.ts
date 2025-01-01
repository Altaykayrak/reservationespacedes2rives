import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAvailableDates = (childClass?: string) => {
  const { data: availableWednesdays } = useQuery({
    queryKey: ["availableWednesdays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_wednesdays")
        .select(`
          *,
          wednesday_allowed_classes (
            school_class
          )
        `);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: availableHolidays } = useQuery({
    queryKey: ["availableHolidays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select(`
          *,
          holiday_allowed_classes (
            school_class
          )
        `);
      
      if (error) throw error;
      return data;
    },
  });

  const isDateAvailable = (date: Date, childClass?: string) => {
    if (!childClass) return false;

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