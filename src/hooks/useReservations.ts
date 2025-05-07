import { useState } from "react";
import { useQuery, useQueryClient, useIsMutating } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WednesdayReservationWithChild, ChildWithProfile } from "@/types/reservations";
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

  // Noter que nous ne récupérons pas les enfants directement ici
  // car nous utilisons useChildrenData dans le composant
  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      console.log("Fetching children...");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.log("No session found");
        return [];
      }

      const { data, error } = await supabase
        .from("children")
        .select(`
          *,
          profiles!children_profile_id_fkey (
            school_city
          )
        `)
        .eq('profile_id', session.user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
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

  const { data: wednesdayReservations = [], refetch: refetchReservations } = useQuery({
    queryKey: ["wednesday_reservations"],
    queryFn: async () => {
      console.log("Récupération des réservations du mercredi...");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("État de la session:", session);
      
      if (!session?.user?.id) {
        console.log("Aucune session trouvée");
        return [];
      }

      const { data: reservations, error: reservationsError } = await supabase
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
          reservation_number,
          children,
          available_wednesdays!fk_wednesday_id (
            id,
            date,
            max_participants_kindergarten,
            max_participants_primary
          )
        `)
        .eq('status', 'confirmed')
        .not('children', 'is', null);

      console.log("Réservations depuis la vue:", reservations);
      if (reservationsError) {
        console.error("Erreur lors de la récupération des réservations:", reservationsError);
        throw reservationsError;
      }

      const filteredReservations = reservations?.filter(reservation => {
        const childData = reservation.children as unknown as ChildWithProfile;
        return children?.some(child => child.id === childData.id);
      }) || [];

      const transformedData = filteredReservations.map(reservation => {
        const childData = reservation.children as unknown as ChildWithProfile;
        return {
          ...reservation,
          children: childData,
          available_wednesdays: reservation.available_wednesdays
        } as WednesdayReservationWithChild;
      });

      console.log("Données finales transformées:", transformedData);
      return transformedData;
    },
    staleTime: 30000,
    gcTime: 3600000,
  });

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

  const { handleSubmit, showSuccessDialog, setShowSuccessDialog } = useWednesdayReservationSubmission(
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
    showSuccessDialog,
    setShowSuccessDialog
  };
};
