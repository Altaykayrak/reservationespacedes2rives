
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHolidayPeriods = () => {
  const { data: holidayPeriods, isLoading, error: queryError } = useQuery({
    queryKey: ["holidayPeriods"],
    queryFn: async () => {
      console.log("[useHolidayPeriods] Récupération des périodes de vacances...");
      try {
        const { data, error } = await supabase
          .from("available_holiday_periods")
          .select("*")
          .gte("end_date", new Date().toISOString().split("T")[0])
          .order("start_date");
        
        if (error) {
          console.error("[useHolidayPeriods] Erreur lors de la récupération des périodes:", error);
          toast.error("Impossible de charger les périodes de vacances");
          throw error;
        }
        
        console.log("[useHolidayPeriods] Périodes de vacances récupérées:", data?.length);
        return data;
      } catch (err) {
        console.error("[useHolidayPeriods] Exception:", err);
        toast.error("Impossible de charger les périodes de vacances");
        return [];
      }
    },
  });

  return { 
    holidayPeriods,
    isLoading,
    error: queryError
  };
};
