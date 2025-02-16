
import { useState } from "react";
import { useQuery, useQueryClient, useIsMutating } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WednesdayReservationWithChild } from "@/types/reservations";
import { useWednesdayReservationSubmission } from "./useWednesdayReservationSubmission";

interface WednesdayReservationResponse {
  id: string;
  child_id: string;
  wednesday_id: string;
  without_meal: boolean;
  early_dropoff: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  children: {
    id: string;
    first_name: string;
    last_name: string;
    school_class: string;
    profile: {
      school_city: string;
    };
  };
  available_wednesdays: {
    id: string;
    date: string;
    max_participants_kindergarten: number;
    max_participants_primary: number;
  };
}

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
        .from('wednesday_reservations_with_children')
        .select(`
          id,
          child_id,
          wednesday_id,
          without_meal,
          early_dropoff,
          status,
          created_at,
          updated_at,
          children,
          available_wednesdays!fk_wednesday_id(*)
        `)
        .in('child_id', childrenIds)
        .eq('status', 'confirmed');

      if (error) {
        console.error("Erreur lors de la récupération des réservations:", error);
        throw error;
      }

      console.log("Réservations brutes reçues:", data);

      // Cast the data to the correct type and transform
      const typedData = data as unknown as WednesdayReservationResponse[];
      const transformedReservations = typedData.map(reservation => ({
        id: reservation.id,
        child_id: reservation.child_id,
        wednesday_id: reservation.wednesday_id,
        without_meal: reservation.without_meal || false,
        early_dropoff: reservation.early_dropoff || false,
        status: reservation.status,
        created_at: reservation.created_at,
        updated_at: reservation.updated_at,
        children: {
          id: reservation.children.id,
          first_name: reservation.children.first_name,
          last_name: reservation.children.last_name,
          school_class: reservation.children.school_class,
          profile: {
            school_city: reservation.children.profile.school_city
          }
        },
        available_wednesdays: reservation.available_wednesdays
      }));

      console.log("Nombre de réservations transformées:", transformedReservations.length);
      return transformedReservations;
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
