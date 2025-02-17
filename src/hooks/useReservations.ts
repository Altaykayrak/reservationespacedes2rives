
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
        .select(`
          *,
          profiles!children_profile_id_fkey (
            school_city
          )
        `)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    staleTime: 30000,
    gcTime: 3600000,
  });

  const { data: wednesdayReservations = [], refetch: refetchReservations } = useQuery({
    queryKey: ["wednesday_reservations"],
    queryFn: async () => {
      console.log("Récupération des réservations du mercredi...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        console.log("Aucune session trouvée");
        return [];
      }

      const { data: userChildren, error: childrenError } = await supabase
        .from('children')
        .select('id')
        .eq('profile_id', session.user.id);

      if (childrenError) throw childrenError;
      if (!userChildren?.length) return [];

      const childrenIds = userChildren.map(child => child.id);
      console.log("IDs des enfants trouvés:", childrenIds);

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
          reservation_number,
          children:child_id (
            id,
            first_name,
            last_name,
            school_class,
            profile:children_profile_id_fkey (
              school_city
            )
          ),
          available_wednesdays!wednesday_id (
            id,
            date,
            max_participants_kindergarten,
            max_participants_primary
          )
        `)
        .in('child_id', childrenIds)
        .eq('status', 'confirmed');

      if (error) {
        console.error("Erreur lors de la récupération des réservations:", error);
        throw error;
      }

      // Transformer les données pour correspondre au type WednesdayReservationWithChild
      const transformedData = data.map(reservation => ({
        id: reservation.id,
        child_id: reservation.child_id,
        wednesday_id: reservation.wednesday_id,
        without_meal: reservation.without_meal,
        early_dropoff: reservation.early_dropoff,
        status: reservation.status,
        created_at: reservation.created_at,
        updated_at: reservation.updated_at,
        reservation_number: reservation.reservation_number,
        children: reservation.children,
        available_wednesdays: reservation.available_wednesdays
      }));

      console.log("Réservations transformées:", transformedData);
      return transformedData as WednesdayReservationWithChild[];
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
