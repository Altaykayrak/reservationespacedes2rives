
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type WednesdayReservationWithChild = Tables<"wednesday_reservations"> & {
  children: Tables<"children">;
};

export const useReservations = () => {
  const queryClient = useQueryClient();
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedDates, setSelectedDates] = useState<Array<{
    date: Date;
    withoutMeal: boolean;
    earlyDropoff: boolean;
  }>>([]);

  // Optimisation des requêtes children avec staleTime et cacheTime
  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      console.log("Fetching children...");
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    staleTime: 30000, // Les données restent "fraîches" pendant 30 secondes
    cacheTime: 3600000, // Cache conservé pendant 1 heure
  });

  // Optimisation des requêtes wednesday_reservations
  const { data: wednesdayReservations, refetch: refetchReservations } = useQuery({
    queryKey: ["wednesday_reservations"],
    queryFn: async () => {
      console.log("Fetching wednesday reservations...");
      const { data, error } = await supabase
        .from("wednesday_reservations")
        .select(`
          id,
          child_id,
          wednesday_id,
          without_meal,
          early_dropoff,
          status,
          children (
            id,
            first_name,
            last_name,
            school_class
          )
        `)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as WednesdayReservationWithChild[];
    },
    staleTime: 30000,
    cacheTime: 3600000,
  });

  // Préchargement des données
  const prefetchData = async () => {
    await queryClient.prefetchQuery({
      queryKey: ["children"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("children")
          .select("*")
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        return data;
      },
    });

    await queryClient.prefetchQuery({
      queryKey: ["wednesday_reservations"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("wednesday_reservations")
          .select(`
            id,
            child_id,
            wednesday_id,
            without_meal,
            early_dropoff,
            status,
            children (
              id,
              first_name,
              last_name,
              school_class
            )
          `)
          .eq('status', 'confirmed')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        return data as WednesdayReservationWithChild[];
      },
    });
  };

  // Appel du préchargement au montage du composant
  useState(() => {
    prefetchData();
  });

  const isDateReservedForChild = (childId: string, date: Date) => {
    if (!wednesdayReservations || !childId) return false;
    
    return wednesdayReservations.some(
      (reservation) => 
        reservation.child_id === childId &&
        reservation.wednesday_id === date.toISOString().split('T')[0]
    );
  };

  const handleDateToggle = (date: Date) => {
    setSelectedDates(prev => {
      const existingDate = prev.find(d => d.date.getTime() === date.getTime());
      if (existingDate) {
        return prev.filter(d => d.date.getTime() !== date.getTime());
      } else {
        return [...prev, { date, withoutMeal: false, earlyDropoff: false }];
      }
    });
  };

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    setSelectedDates(prev => 
      prev.map(d => 
        d.date.getTime() === date.getTime() 
          ? { ...d, [option]: value }
          : d
      )
    );
  };

  const resetForm = () => {
    setSelectedChild("");
    setSelectedDates([]);
  };

  return {
    selectedDates,
    selectedChild,
    setSelectedChild,
    children,
    handleDateToggle,
    handleOptionChange,
    handleSubmit: () => {}, // Cette fonction sera implémentée plus tard avec useReservationSubmission
    isDateReservedForChild,
    resetForm,
    refetchReservations,
  };
};
