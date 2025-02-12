
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyReservations } from "./EmptyReservations";
import { ChildReservationCard } from "./ChildReservationCard";
import { useEffect } from "react";
import { WednesdayReservationWithChild } from "@/types/reservations";

type GroupedReservations = Record<string, {
  childName: string;
  schoolClass: string;
  reservations: WednesdayReservationWithChild[];
}>;

interface ReservationsListProps {
  reservations: WednesdayReservationWithChild[] | null;
}

export const ReservationsList = ({ reservations }: ReservationsListProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wednesday_reservations'
        },
        (payload) => {
          console.log('Changement de réservation détecté:', payload);
          queryClient.invalidateQueries({ queryKey: ["wednesday_reservations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
          Vos mercredis réservés (sous réserve de règlement)
        </h2>
      </div>
      <ScrollArea className="h-[450px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
          {Object.entries(reservationsByChild).map(([childId, data]) => (
            <ChildReservationCard
              key={childId}
              childName={data.childName}
              schoolClass={data.schoolClass}
              reservations={data.reservations}
              onUpdate={() => queryClient.invalidateQueries({ queryKey: ["wednesday_reservations"] })}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
