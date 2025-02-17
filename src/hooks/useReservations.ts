
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
      console.log("État de la session:", session);
      
      if (!session?.user?.id) {
        console.log("Aucune session trouvée");
        return [];
      }

      console.log("Session trouvée pour l'utilisateur:", session.user.id);

      const { data: userChildren, error: childrenError } = await supabase
        .from('children')
        .select('id')
        .eq('profile_id', session.user.id);

      if (childrenError) {
        console.error("Erreur lors de la récupération des enfants:", childrenError);
        throw childrenError;
      }
      
      if (!userChildren?.length) {
        console.log("Aucun enfant trouvé pour l'utilisateur");
        return [];
      }

      const childrenIds = userChildren.map(child => child.id);
      console.log("IDs des enfants trouvés:", childrenIds);

      // Vérifier toutes les réservations sans filtre d'abord
      const { data: allReservations, error: allReservationsError } = await supabase
        .from('wednesday_reservations')
        .select('*');

      console.log("Toutes les réservations dans la table:", allReservations);
      if (allReservationsError) console.error("Erreur lors de la vérification de toutes les réservations:", allReservationsError);

      // Vérifier les réservations juste avec le filtre d'enfants
      const { data: reservationsWithChildFilter, error: childFilterError } = await supabase
        .from('wednesday_reservations')
        .select('*')
        .in('child_id', childrenIds);

      console.log("Réservations avec filtre enfants uniquement:", reservationsWithChildFilter);
      if (childFilterError) console.error("Erreur filtre enfants:", childFilterError);

      // Vérifier les réservations juste avec le filtre de status
      const { data: reservationsWithStatusFilter, error: statusFilterError } = await supabase
        .from('wednesday_reservations')
        .select('*')
        .eq('status', 'confirmed');

      console.log("Réservations avec filtre status uniquement:", reservationsWithStatusFilter);
      if (statusFilterError) console.error("Erreur filtre status:", statusFilterError);

      // Requête finale avec tous les filtres
      const { data: reservations, error: reservationsError } = await supabase
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
          )
        `)
        .in('child_id', childrenIds)
        .eq('status', 'confirmed');

      console.log("Réservations avec tous les filtres:", reservations);
      if (reservationsError) {
        console.error("Erreur lors de la récupération des réservations:", reservationsError);
        throw reservationsError;
      }

      if (!reservations?.length) {
        console.log("Aucune réservation trouvée");
        return [];
      }

      // Récupérer les mercredis associés séparément
      const wednesdayIds = reservations.map(r => r.wednesday_id);
      const { data: wednesdays, error: wednesdaysError } = await supabase
        .from('available_wednesdays')
        .select('*')
        .in('id', wednesdayIds);

      console.log("Mercredis associés:", wednesdays);
      if (wednesdaysError) {
        console.error("Erreur lors de la récupération des mercredis:", wednesdaysError);
        throw wednesdaysError;
      }

      // Combiner les données
      const transformedData = reservations.map(reservation => {
        const wednesday = wednesdays?.find(w => w.id === reservation.wednesday_id);
        return {
          ...reservation,
          available_wednesdays: wednesday
        };
      });

      console.log("Réservations finales transformées:", transformedData);
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
