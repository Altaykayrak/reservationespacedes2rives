import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const useClosedPeriods = () => {
  const { data: closedPeriods } = useQuery({
    queryKey: ["closed_periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("closed_periods")
        .select("*");
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const isDateClosed = (date: Date): boolean => {
    if (!closedPeriods || closedPeriods.length === 0) return false;
    const dateStr = format(date, "yyyy-MM-dd");
    return closedPeriods.some(cp => dateStr >= cp.start_date && dateStr <= cp.end_date);
  };

  const getClosedDatesInRange = (startDate: string, endDate: string): string[] => {
    if (!closedPeriods) return [];
    const result: string[] = [];
    for (const cp of closedPeriods) {
      const cpStart = new Date(Math.max(new Date(cp.start_date).getTime(), new Date(startDate).getTime()));
      const cpEnd = new Date(Math.min(new Date(cp.end_date).getTime(), new Date(endDate).getTime()));
      const current = new Date(cpStart);
      while (current <= cpEnd) {
        result.push(format(current, "yyyy-MM-dd"));
        current.setDate(current.getDate() + 1);
      }
    }
    return result;
  };

  return { closedPeriods, isDateClosed, getClosedDatesInRange };
};