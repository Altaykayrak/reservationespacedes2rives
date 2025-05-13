
import { startOfWeek, format } from "date-fns";
import { fr } from "date-fns/locale";

export const useWeeklyDates = () => {
  // Helper function to group dates by week
  const getDatesPerWeek = (dates: Date[]) => {
    const weeks: Record<string, Date[]> = {};
    
    dates.forEach(date => {
      // Get the week number (ISO week, starting on Monday)
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      
      weeks[weekKey].push(date);
    });
    
    return weeks;
  };

  return {
    getDatesPerWeek
  };
};
