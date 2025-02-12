
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type WednesdayReservationWithChild = Tables<"wednesday_reservations"> & {
  children: Tables<"children">;
};

export const useReservations = () => {
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedDates, setSelectedDates] = useState<Array<{
    date: Date;
    withoutMeal: boolean;
    earlyDropoff: boolean;
  }>>([]);

  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: wednesdayReservations, refetch: refetchReservations } = useQuery({
    queryKey: ["wednesday_reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wednesday_reservations")
        .select(`
          *,
          children (*)
        `)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as WednesdayReservationWithChild[];
    },
  });

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      return user;
    },
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
