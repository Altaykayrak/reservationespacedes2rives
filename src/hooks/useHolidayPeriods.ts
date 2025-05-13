
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { customToast } from "./use-toast";
import { useRef } from "react";

export const useHolidayPeriods = () => {
  const isInitialFetch = useRef(true);
  
  // Utilisez un queryKey stable pour éviter des déclenchements multiples
  const { data: holidayPeriods, isLoading, error: queryError } = useQuery({
    queryKey: ["holidayPeriods"],
    queryFn: async () => {
      if (isInitialFetch.current) {
        console.log("[useHolidayPeriods] Récupération des périodes de vacances...");
        isInitialFetch.current = false;
      }
      
      try {
        const { data, error } = await supabase
          .from("available_holiday_periods")
          .select("*")
          .gte("end_date", new Date().toISOString().split("T")[0])
          .order("start_date");
        
        if (error) {
          console.error("[useHolidayPeriods] Erreur lors de la récupération des périodes:", error);
          customToast.error("Impossible de charger les périodes de vacances");
          throw error;
        }
        
        console.log("[useHolidayPeriods] Périodes de vacances récupérées:", data?.length);
        return data;
      } catch (err) {
        console.error("[useHolidayPeriods] Exception:", err);
        customToast.error("Impossible de charger les périodes de vacances");
        return [];
      }
    },
    // Augmenter le staleTime pour éviter des refetch trop fréquents
    staleTime: 10 * 60 * 1000, // 10 minutes
    // Désactiver les requêtes automatiques en arrière-plan qui peuvent causer des boucles
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1 // Réduire le nombre de tentatives
  });

  return { 
    holidayPeriods,
    isLoading,
    error: queryError
  };
};
