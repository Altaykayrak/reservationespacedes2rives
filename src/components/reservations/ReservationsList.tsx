import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Utensils, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

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

  // Fetch holiday periods to filter reservations
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

  // Filter reservations based on the page
  const filteredReservations = reservations?.filter(reservation => {
    if (!isHolidayPage) {
      return true; // Show all reservations on the regular reservations page
    }

    // Check if the reservation date falls within any holiday period
    return holidayPeriods?.some(period => {
      const reservationDate = new Date(reservation.reservation_date);
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);
      return reservationDate >= startDate && reservationDate <= endDate;
    });
  });

  // Group reservations by child
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

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Réservations actuelles</h2>
      <div className="space-y-4">
        {reservationsByChild && Object.entries(reservationsByChild).map(([childId, data]) => (
          <Card key={childId} className="p-4">
            <h3 className="font-medium text-lg mb-2">
              {data.childName} ({data.schoolClass})
            </h3>
            <ul className="space-y-2">
              {data.reservations.map((reservation) => (
                <li key={reservation.id} className="space-y-1">
                  <div className="flex items-center gap-4">
                    <span>
                      {format(new Date(reservation.reservation_date), "EEEE d MMMM yyyy", { locale: fr })}
                    </span>
                    <div className="flex gap-2">
                      {reservation.without_meal && (
                        <div className="flex items-center gap-1 text-sm text-red-600" title="Sans repas">
                          <Utensils size={16} />
                          <span className="sr-only">Sans repas</span>
                        </div>
                      )}
                      {reservation.early_dropoff && (
                        <div className="flex items-center gap-1 text-sm text-blue-600" title="Accueil avant 8h30">
                          <Clock size={16} />
                          <span className="sr-only">Accueil avant 8h30</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 pl-4">
                    {reservation.without_meal && <span>• Sans repas</span>}
                    {reservation.early_dropoff && (
                      <span className="ml-4">• Accueil avant 8h30</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
};