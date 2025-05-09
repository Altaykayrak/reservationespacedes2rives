
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyReservations } from "./EmptyReservations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChildWednesdayReservationCard } from "./ChildWednesdayReservationCard";
import { WednesdayReservationWithChild } from "@/types/reservations";
import { useChildrenData } from "@/hooks/useChildrenData";

type GroupedReservations = Record<string, {
  childName: string;
  schoolClass: string;
  reservations: WednesdayReservationWithChild[];
}>;

export const WednesdayReservationsList = () => {
  // Utiliser les données des enfants depuis le hook
  const { children } = useChildrenData();
  
  // Utiliser directement useQuery pour récupérer les réservations
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
        } as WednesdayReservationWithChild;
      });

      console.log("Données finales transformées:", transformedData);
      return transformedData;
    },
    staleTime: 30000,
    gcTime: 3600000,
    enabled: !!children // Activer la requête uniquement si nous avons des données d'enfants
  });

  console.log("Réservations du mercredi :", wednesdayReservations);

  if (!wednesdayReservations || wednesdayReservations.length === 0) {
    return <EmptyReservations />;
  }

  const reservationsByChild = wednesdayReservations.reduce((acc, reservation) => {
    const childId = reservation.child_id;
    const child = reservation.children as { 
      first_name: string; 
      last_name: string; 
      school_class: string;
    };
    
    if (!child) return acc;
    
    if (!acc[childId]) {
      acc[childId] = {
        childName: `${child.first_name} ${child.last_name}`,
        schoolClass: child.school_class,
        reservations: [],
      };
    }
    acc[childId].reservations.push(reservation);
    return acc;
  }, {} as GroupedReservations);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Vos mercredis réservés (sous réserve de règlement)
        </h2>
        <p className="text-sm text-red-600">
          Pour toute modification de vos réservations (ajout ou suppression de journées), merci de contacter l'accueil.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(reservationsByChild).map(([childId, data]) => (
          <ChildWednesdayReservationCard
            key={childId}
            childName={data.childName}
            schoolClass={data.schoolClass}
            reservations={data.reservations}
            onUpdate={refetchReservations}
          />
        ))}
      </div>
    </div>
  );
};
