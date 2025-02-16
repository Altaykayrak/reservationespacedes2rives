
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
  const sortReservations = (reservations: WednesdayReservationWithChild[]) => {
    return [...reservations].sort((a, b) => {
      const dateA = a.available_wednesdays?.date;
      const dateB = b.available_wednesdays?.date;
      
      if (!dateA || !dateB) return 0;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  };

  return (
    <Card className="overflow-hidden border-gray-100 shadow-sm h-full">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white p-2 md:p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full bg-primary/10">
              <User className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-medium text-gray-800">{childName}</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground">{schoolClass}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-[8px] md:text-[10px]">
            {reservations.length} réservation{reservations.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
      <div className="divide-y divide-gray-50 bg-white">
        {sortReservations(reservations).map((reservation) => (
          <div key={reservation.id} className="flex flex-col p-3 transition-colors hover:bg-gray-50">
            <span className="text-sm font-medium text-gray-800">
              {format(
                new Date(`${reservation.available_wednesdays.date}T00:00:00`),
                "EEEE d MMMM yyyy",
                { locale: fr }
              )}
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {reservation.without_meal && (
                <span className="text-xs bg-orange-100 px-2 py-0.5 rounded text-orange-800">
                  Sans repas
                </span>
              )}
              {reservation.early_dropoff && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
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
