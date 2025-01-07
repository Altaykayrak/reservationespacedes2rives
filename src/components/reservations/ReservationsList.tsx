import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, Utensils, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Calendar className="h-12 w-12 text-muted-foreground" />
        <div>
          <h3 className="font-semibold">Aucune réservation</h3>
          <p className="text-sm text-muted-foreground">
            Vous n'avez pas encore de réservations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Réservations actuelles</h2>
      <ScrollArea className="h-[500px]">
        <div className="space-y-4 pr-4">
          {Object.entries(reservationsByChild).map(([childId, data]) => (
            <Card key={childId} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">{data.childName}</h3>
                  <p className="text-sm text-muted-foreground">{data.schoolClass}</p>
                </div>
                <Badge variant="secondary">
                  {data.reservations.length} réservation{data.reservations.length > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="space-y-3">
                {data.reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <span className="font-medium">
                      {format(new Date(reservation.reservation_date), "EEEE d MMMM yyyy", { locale: fr })}
                    </span>
                    <div className="flex items-center gap-3">
                      {reservation.without_meal && (
                        <div className="flex items-center gap-1" title="Sans repas">
                          <Utensils className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-muted-foreground">Sans repas</span>
                        </div>
                      )}
                      {reservation.early_dropoff && (
                        <div className="flex items-center gap-1" title="Accueil avant 8h30">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-muted-foreground">Avant 8h30</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};