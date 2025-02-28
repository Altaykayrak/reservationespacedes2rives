import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { HolidayReservationWithChild } from "@/types/reservations";
interface ChildReservationCardProps {
  childName: string;
  schoolClass: string;
  reservations: HolidayReservationWithChild[];
  onUpdate: () => void;
}
export const HolidayChildReservationCard = ({
  childName,
  schoolClass,
  reservations,
  onUpdate
}: ChildReservationCardProps) => {
  return <Card className="overflow-hidden border-gray-100 shadow-sm h-full">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white p-2 md:p-3 bg-zinc-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full bg-primary/10">
              <User className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-medium bg-neutral-200 text-cyan-950">{childName}</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground">{schoolClass}</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center justify-center h-5 text-black text-[8px] md:text-[10px] bg-sky-50">
            {reservations.length} réservation{reservations.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
      <div className="divide-y divide-gray-50 bg-white">
        {reservations.map(reservation => <div key={reservation.id} className="flex flex-col p-3 transition-colors hover:bg-gray-50">
            <span className="text-sm font-medium text-gray-800 text-left">
              {new Date(reservation.reservation_date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {reservation.without_meal && <span className="text-xs bg-orange-100 px-2 py-0.5 rounded text-orange-800">
                  Sans repas
                </span>}
              {reservation.early_dropoff && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Accueil avant 8h30
                </span>}
            </div>
          </div>)}
      </div>
    </Card>;
};