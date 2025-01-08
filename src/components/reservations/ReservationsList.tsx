import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyReservations } from "./EmptyReservations";
import { ChildReservationCard } from "./ChildReservationCard";
import { UtensilsCrossed, Clock } from "lucide-react";
import { isWednesday, isBefore, startOfDay } from "date-fns";

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
  const today = startOfDay(new Date());

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
    const reservationDate = startOfDay(new Date(reservation.reservation_date));
    
    if (isBefore(reservationDate, today)) {
      return false;
    }

    if (isHolidayPage) {
      return holidayPeriods?.some(period => {
        const startDate = startOfDay(new Date(period.start_date));
        const endDate = startOfDay(new Date(period.end_date));
        return reservationDate >= startDate && reservationDate <= endDate;
      });
    } else {
      return isWednesday(reservationDate);
    }
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
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          {isHolidayPage ? "Réservations vacances" : "Réservations mercredis"}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground bg-gray-50/50 p-2 rounded-lg border border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="inline-flex items-center rounded-full bg-red-100/80 p-1.5 text-red-700">
              <UtensilsCrossed className="h-3 w-3" />
            </div>
            <span>Sans repas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="inline-flex items-center rounded-full bg-blue-100/80 p-1.5 text-blue-700">
              <Clock className="h-3 w-3" />
            </div>
            <span>Accueil avant 8h30</span>
          </div>
        </div>
      </div>
      <ScrollArea className="h-[450px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
          {Object.entries(reservationsByChild || {}).map(([childId, data]) => (
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