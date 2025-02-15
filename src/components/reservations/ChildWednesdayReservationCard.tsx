
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { WednesdayReservationWithChild } from "@/types/reservations";
import { Card } from "@/components/ui/card";
import { ReservationBadges } from "./ReservationBadges";

interface ChildWednesdayReservationCardProps {
  childName: string;
  schoolClass: string;
  reservations: WednesdayReservationWithChild[];
  onUpdate: () => void;
}

export const ChildWednesdayReservationCard = ({
  childName,
  schoolClass,
  reservations,
  onUpdate,
}: ChildWednesdayReservationCardProps) => {
  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-lg">{childName}</h3>
        <p className="text-sm text-gray-600">{schoolClass}</p>
      </div>
      <div className="space-y-3">
        {reservations
          .sort((a, b) => {
            const dateA = new Date(a.available_wednesdays?.date || "");
            const dateB = new Date(b.available_wednesdays?.date || "");
            return dateA.getTime() - dateB.getTime();
          })
          .map((reservation) => (
            <div
              key={reservation.id}
              className="p-3 bg-gray-50 rounded-lg space-y-2"
            >
              <p className="font-medium">
                {reservation.available_wednesdays?.date
                  ? format(new Date(reservation.available_wednesdays.date), "EEEE d MMMM yyyy", {
                      locale: fr,
                    })
                  : "Date inconnue"}
              </p>
              <ReservationBadges
                withoutMeal={reservation.without_meal}
                earlyDropoff={reservation.early_dropoff}
              />
            </div>
          ))}
      </div>
    </Card>
  );
};
