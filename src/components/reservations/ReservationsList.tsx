import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyReservations } from "./EmptyReservations";
import { ChildReservationCard } from "./ChildReservationCard";
import { useEffect } from "react";

type ReservationWithChild = Tables<"reservations"> & {
  children: Tables<"children">;
};

type GroupedReservations = Record<string, {
  childName: string;
  schoolClass: string;
  reservations: ReservationWithChild[];
}>;

interface ReservationsListProps {
  reservations: ReservationWithChild[] | null;
}

export const ReservationsList = ({ reservations }: ReservationsListProps) => {
  const { data: holidayPeriods } = useQuery({
    queryKey: ["availableHolidays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  // Filter out past reservations and keep only NON-holiday reservations
  const filteredReservations = reservations?.filter(reservation => {
    const reservationDate = new Date(reservation.reservation_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    // Check if the reservation is in the future
    if (reservationDate < today) return false;

    // Check if the reservation date falls within any holiday period
    const isHolidayReservation = holidayPeriods?.some(holiday => {
      const startDate = new Date(holiday.start_date);
      const endDate = new Date(holiday.end_date);
      return reservationDate >= startDate && reservationDate <= endDate;
    });

    // Keep only NON-holiday reservations (mercredis hors vacances)
    return !isHolidayReservation;
  });

  const reservationsByChild = filteredReservations?.reduce((acc, reservation) => {
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
          window.location.reload();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!reservationsByChild || Object.keys(reservationsByChild).length === 0) {
    return <EmptyReservations />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
          Vos mercredis réservés (sous réserve de règlement)
        </h2>
      </div>
      <ScrollArea className="h-[450px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
          {Object.entries(reservationsByChild || {}).map(([childId, data]) => (
            <ChildReservationCard
              key={childId}
              childName={data.childName}
              schoolClass={data.schoolClass}
              reservations={data.reservations}
              onUpdate={() => window.location.reload()}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};