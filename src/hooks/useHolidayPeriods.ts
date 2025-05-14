
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
      return data;
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
