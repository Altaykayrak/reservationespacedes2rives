
import { useState } from "react";
import { useQuery, useQueryClient, useIsMutating } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WednesdayReservationWithChild } from "@/types/reservations";
import { useWednesdayReservationSubmission } from "./useWednesdayReservationSubmission";

export const useReservations = () => {
  const queryClient = useQueryClient();
  const isSubmitting = useIsMutating() > 0;
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedDates, setSelectedDates] = useState<Array<{
    date: Date;
    withoutMeal: boolean;
    earlyDropoff: boolean;
  }>>([]);

  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      console.log("Fetching children...");
      const { data, error } = await supabase
        .from("children")
        .select("*, profiles:children!inner(school_city)")
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    staleTime: 30000,
    gcTime: 3600000,
  });

  const { data: wednesdayReservations, refetch: refetchReservations } = useQuery({
    queryKey: ["wednesday_reservations"],
    queryFn: async () => {
      console.log("Fetching wednesday reservations...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        console.log("No session found");
        return [];
      }

      // D'abord, récupérer les IDs des enfants de l'utilisateur
      const { data: userChildren, error: childrenError } = await supabase
        .from('children')
        .select('id')
        .eq('profile_id', session.user.id);

      if (childrenError) throw childrenError;
      if (!userChildren?.length) return [];

      const childrenIds = userChildren.map(child => child.id);

      // Ensuite, récupérer les réservations pour ces enfants
      const { data, error } = await supabase
        .from('wednesday_reservations')
        .select(`
          id,
          child_id,
          wednesday_id,
          without_meal,
          early_dropoff,
          status,
          created_at,
          updated_at,
          children!wednesday_reservations_child_id_fkey (
            id,
            first_name,
            last_name,
            school_class,
            profiles!inner (
              school_city
            )
          ),
          available_wednesdays!fk_wednesday_id (
            id,
            date,
            max_participants_kindergarten,
            max_participants_primary
          )
        `)
        .in('child_id', childrenIds)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transformer les données pour correspondre au type WednesdayReservationWithChild
      return data.map(reservation => ({
        ...reservation,
        children: {
          ...reservation.children,
          profile: {
            school_city: reservation.children.profiles.school_city
          }
        }
      })) as WednesdayReservationWithChild[];
    },
    staleTime: 30000,
    gcTime: 3600000,
  });

  const handleDateToggle = (date: Date) => {
    setSelectedDates(prev => {
      const existing = prev.find(d => d.date.getTime() === date.getTime());
      if (existing) {
        return prev.filter(d => d.date.getTime() !== date.getTime());
      }
      return [...prev, { date, withoutMeal: false, earlyDropoff: false }];
    });
  };

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    setSelectedDates(prev => prev.map(d => {
      if (d.date.getTime() === date.getTime()) {
        return { ...d, [option]: value };
      }
      return d;
    }));
  };

  const isDateReservedForChild = (childId: string, date: Date) => {
    if (!wednesdayReservations) return false;
    
    return wednesdayReservations.some(
      (reservation) => 
        reservation.child_id === childId &&
        reservation.available_wednesdays?.date === date.toISOString().split('T')[0]
    );
  };

  const resetForm = () => {
    setSelectedChild("");
    setSelectedDates([]);
  };

  const { handleSubmit } = useWednesdayReservationSubmission(
    selectedChild,
    selectedDates,
    (date) => isDateReservedForChild(selectedChild, date),
    refetchReservations,
    resetForm
  );

  return {
    selectedDates,
    selectedChild,
    setSelectedChild,
    children,
    wednesdayReservations,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    isDateReservedForChild,
    resetForm,
    refetchReservations,
    isSubmitting,
  };
};
