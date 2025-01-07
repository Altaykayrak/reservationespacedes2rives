import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ReservationItem } from "./ReservationItem";
import { Tables } from "@/integrations/supabase/types";

type ReservationWithChild = Tables<"reservations"> & {
  children: Tables<"children">;
};

interface ChildReservationCardProps {
  childName: string;
  schoolClass: string;
  reservations: ReservationWithChild[];
}

export const ChildReservationCard = ({
  childName,
  schoolClass,
  reservations,
}: ChildReservationCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">{childName}</h3>
          <p className="text-sm text-muted-foreground">{schoolClass}</p>
        </div>
        <Badge variant="secondary">
          {reservations.length} réservation{reservations.length > 1 ? 's' : ''}
        </Badge>
      </div>
      <div className="space-y-3">
        {reservations.map((reservation) => (
          <ReservationItem key={reservation.id} reservation={reservation} />
        ))}
      </div>
    </Card>
  );
};