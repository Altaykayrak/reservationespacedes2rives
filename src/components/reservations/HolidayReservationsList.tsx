import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyReservations } from "./EmptyReservations";
import { ChildReservationCard } from "./ChildReservationCard";
import { Tables } from "@/integrations/supabase/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

type ReservationWithChild = Tables<"reservations"> & {
  children: Tables<"children">;
};

type GroupedReservations = Record<string, {
  childName: string;
  schoolClass: string;
  reservations: ReservationWithChild[];
}>;

export const HolidayReservationsList = () => {
  const navigate = useNavigate();

  const { data: reservations, isError, error, refetch } = useQuery({
    queryKey: ["holiday_reservations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          children (*)
        `)
        .not('period_id', 'is', null) // Only get holiday reservations (with period_id)
        .order('reservation_date', { ascending: true });
      
      if (error) {
        console.error("Error fetching reservations:", error);
        throw error;
      }
      return data as ReservationWithChild[];
    },
  });

  useEffect(() => {
    // Subscribe to all changes (INSERT, UPDATE, DELETE) on the reservations table
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          console.log('Reservation change detected:', payload);
          refetch();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
    if (errorMessage.includes("Not authenticated")) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            Vous devez être connecté pour voir vos réservations.{" "}
            <button 
              onClick={() => navigate("/login")}
              className="underline hover:no-underline"
            >
              Se connecter
            </button>
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Une erreur est survenue lors du chargement des réservations. Veuillez réessayer.
        </AlertDescription>
      </Alert>
    );
  }

  if (!reservations || reservations.length === 0) {
    return <EmptyReservations />;
  }

  const reservationsByChild = reservations.reduce((acc, reservation) => {
    const childId = reservation.child_id;
    if (!acc[childId]) {
      acc[childId] = {
        childName: `${reservation.children.first_name} ${reservation.children.last_name}`,
        schoolClass: reservation.children.school_class,
        reservations: [],
      };
    }
    acc[childId].reservations.push(reservation);
    return acc;
  }, {} as GroupedReservations);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
          Vos vacances réservées (sous réserve de règlement)
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Pour toute modification de vos réservations (ajout ou suppression de journées), merci de contacter l'accueil.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(reservationsByChild).map(([childId, data]) => (
          <ChildReservationCard
            key={childId}
            childName={data.childName}
            schoolClass={data.schoolClass}
            reservations={data.reservations}
            onUpdate={() => refetch()}
          />
        ))}
      </div>
    </div>
  );
};