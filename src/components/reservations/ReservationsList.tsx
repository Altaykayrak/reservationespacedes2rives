import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

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
  // Group reservations by child
  const reservationsByChild = reservations?.reduce((acc, reservation) => {
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
                <li key={reservation.id} className="flex items-center gap-4">
                  <span>
                    {format(new Date(reservation.reservation_date), "EEEE d MMMM yyyy", { locale: fr })}
                  </span>
                  <div className="flex gap-2">
                    {reservation.without_meal && (
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Sans repas
                      </span>
                    )}
                    {reservation.early_dropoff && (
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        Accueil avant 8h30
                      </span>
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