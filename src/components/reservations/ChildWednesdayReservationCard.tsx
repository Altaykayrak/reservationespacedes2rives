
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { WednesdayReservationWithChild } from "@/types/reservations";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <Card className="bg-white rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{childName}</h3>
            <p className="text-sm text-gray-500">{schoolClass}</p>
          </div>
          <Badge className="ml-auto bg-blue-100 text-blue-700 hover:bg-blue-200">
            {reservations.length} réservation{reservations.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {reservations
          .sort((a, b) => 
            new Date(a.available_wednesdays?.date || "").getTime() - 
            new Date(b.available_wednesdays?.date || "").getTime()
          )
          .map((reservation) => (
            <div key={reservation.id} className="p-4">
              <div className="text-sm font-medium text-gray-900">
                {reservation.available_wednesdays?.date
                  ? format(new Date(reservation.available_wednesdays.date), "EEEE d MMMM yyyy", {
                      locale: fr,
                    })
                  : "Date inconnue"}
              </div>
              <div className="mt-2 flex gap-2">
                {reservation.without_meal && (
                  <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                    Sans repas
                  </span>
                )}
                {reservation.early_dropoff && (
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    Accueil avant 8h30
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
};
