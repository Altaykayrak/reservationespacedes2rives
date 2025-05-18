
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useChildrenData } from "@/hooks/useChildrenData";

export const useWednesdayReservations = () => {
  // Utiliser les données des enfants depuis le hook
  const { children } = useChildrenData();
  
  // Utiliser directement useQuery pour récupérer les réservations
  const { data: wednesdayReservations = [], refetch: refetchReservations, isLoading, isError, error } = useQuery({
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

      // Filtrer les réservations pour ne garder que celles des enfants de l'utilisateur courant
      const filteredReservations = reservations?.filter(reservation => {
        const childData = reservation.children as any;
        return children?.some(child => child.id === childData.id);
      }) || [];

      const transformedData = filteredReservations.map(reservation => {
        const childData = reservation.children as any;
        return {
          ...reservation,
          children: childData,
          available_wednesdays: reservation.available_wednesdays
        };
      });

      console.log("Données finales transformées:", transformedData);
      return transformedData;
    },
    staleTime: 30000,
    gcTime: 3600000,
    enabled: !!children // Activer la requête uniquement si nous avons des données d'enfants
  });

  return {
    wednesdayReservations,
    refetchReservations,
    isLoading,
    isError,
    error
  };
};
