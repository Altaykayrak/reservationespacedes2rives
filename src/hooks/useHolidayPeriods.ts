
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";

export const useHolidayPeriods = () => {
  const initialized = useRef(false);
  
  // Log d'initialisation pour débogage
  useEffect(() => {
    if (!initialized.current) {
      console.log("[useHolidayPeriods] Hook initialized");
      initialized.current = true;
    }
  }, []);

  const { data: holidayPeriods, isError, error, isLoading } = useQuery({
    queryKey: ["holidayPeriods"],
    queryFn: async () => {
      console.log("[useHolidayPeriods] Récupération des périodes de vacances...");
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*")
        .gte("end_date", new Date().toISOString().split("T")[0])
        .order("start_date", { ascending: true });
      
      if (error) {
        console.error("Error fetching holiday periods:", error);
        throw error;
      }
      console.log("[useHolidayPeriods] Périodes de vacances récupérées:", data?.length);
      
      // Trier les périodes selon l'ordre spécifique pour les périodes d'été
      const sortedData = [...(data || [])].sort((a, b) => {
        // Extraire les préfixes ETE-XX
        const aMatch = a.name?.match(/^(ETE)-(\d+)$/);
        const bMatch = b.name?.match(/^(ETE)-(\d+)$/);
        
        // Si les deux périodes sont des périodes d'été
        if (aMatch && bMatch) {
          // Comparer les numéros de périodes d'été
          return parseInt(aMatch[2]) - parseInt(bMatch[2]);
        }
        
        // Si seulement a est une période d'été, la mettre en premier
        if (aMatch) return -1;
        
        // Si seulement b est une période d'été, la mettre en premier
        if (bMatch) return 1;
        
        // Pour les autres périodes, conserver l'ordre chronologique
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      });
      
      return sortedData;
    },
    staleTime: 60 * 60 * 1000, // 1 hour cache
    gcTime: 2 * 60 * 60 * 1000,   // 2 hours garbage collection
  });

  return { 
    holidayPeriods,
    isLoading,
    isError,
    error
  };
};
