
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export const useHolidayPeriods = () => {
  const [initialized, setInitialized] = useState(false);
  
  // Mark hook as initialized for debugging
  useEffect(() => {
    if (!initialized) {
      console.log("Fetching holiday periods...");
      setInitialized(true);
    }
  }, [initialized]);

  const { data: holidayPeriods, isError, error, isLoading } = useQuery({
    queryKey: ["holidayPeriods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*")
        .gte("end_date", new Date().toISOString().split("T")[0])
        .order("start_date");
      
      if (error) {
        console.error("Error fetching holiday periods:", error);
        throw error;
      }
      console.log("Retrieved holiday periods:", data?.length);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection
  });

  return { 
    holidayPeriods,
    isLoading,
    isError,
    error
  };
};
