import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyReservations } from "./EmptyReservations";
import { ChildReservationCard } from "./ChildReservationCard";

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
  const location = useLocation();
  const isHolidayPage = location.pathname === "/holiday-reservations";

  const { data: holidayPeriods } = useQuery({
    queryKey: ["available_holiday_periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const filteredReservations = reservations?.filter(reservation => {
    if (!isHolidayPage) {
      return true;
    }

    return holidayPeriods?.some(period => {
      const reservationDate = new Date(reservation.reservation_date);
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);
      return reservationDate >= startDate && reservationDate <= endDate;
    });
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

  if (!reservationsByChild || Object.keys(reservationsByChild).length === 0) {
    return <EmptyReservations />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Réservations actuelles</h2>
      <ScrollArea className="h-[500px]">
        <div className="space-y-4 pr-4">
          {Object.entries(reservationsByChild).map(([childId, data]) => (
            <ChildReservationCard
              key={childId}
              childName={data.childName}
              schoolClass={data.schoolClass}
              reservations={data.reservations}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};