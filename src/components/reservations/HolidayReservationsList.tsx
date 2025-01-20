import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyReservations } from "./EmptyReservations";
import { ChildReservationCard } from "./ChildReservationCard";
import { Tables } from "@/integrations/supabase/types";

type ReservationWithChild = Tables<"reservations"> & {
  children: Tables<"children">;
};

type GroupedReservations = Record<string, {
  childName: string;
  schoolClass: string;
  reservations: ReservationWithChild[];
}>;

export const HolidayReservationsList = () => {
  const { data: reservations } = useQuery({
    queryKey: ["holiday_reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          children (*)
        `)
        .order('reservation_date', { ascending: true });
      
      if (error) throw error;
      return data as ReservationWithChild[];
    },
  });

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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(reservationsByChild).map(([childId, data]) => (
          <ChildReservationCard
            key={childId}
            childName={data.childName}
            schoolClass={data.schoolClass}
            reservations={data.reservations}
          />
        ))}
      </div>
    </div>
  );
};