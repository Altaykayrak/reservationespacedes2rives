import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyReservations } from "./EmptyReservations";
import { ChildReservationCard } from "./ChildReservationCard";
import { UtensilsCrossed, Clock } from "lucide-react";

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
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Réservations actuelles</h2>
        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-full bg-red-100/80 p-2 text-red-700 shadow-sm">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <span>Sans repas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-full bg-blue-100/80 p-2 text-blue-700 shadow-sm">
              <Clock className="h-4 w-4" />
            </div>
            <span>Accueil avant 8h30</span>
          </div>
        </div>
      </div>
      <ScrollArea className="h-[500px]">
        <div className="grid gap-4 pr-4">
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