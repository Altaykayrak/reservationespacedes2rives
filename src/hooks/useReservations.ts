
import { useState } from "react";
import { useQuery, useQueryClient, useIsMutating } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WednesdayReservationWithChild } from "@/types/reservations";

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
        .select("*")
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

      if (childrenError) {
        console.error("Erreur lors de la récupération des enfants:", childrenError);
        throw childrenError;
      }

      if (!userChildren?.length) {
        console.log("Aucun enfant trouvé pour cet utilisateur");
        return [];
      }

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
            school_class
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

      if (error) {
        console.error("Erreur lors de la récupération des réservations:", error);
        throw error;
      }

      console.log("Réservations récupérées:", data);
      return data as WednesdayReservationWithChild[];
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

  return {
    selectedDates,
    selectedChild,
    setSelectedChild,
    children,
    wednesdayReservations,
    handleDateToggle: () => {}, // Cette fonction sera implémentée plus tard
    handleOptionChange: () => {}, // Cette fonction sera implémentée plus tard
    handleSubmit: () => {}, // Cette fonction sera implémentée plus tard
    isDateReservedForChild,
    resetForm: () => {
      setSelectedChild("");
      setSelectedDates([]);
    },
    refetchReservations,
    isSubmitting,
  };
};
