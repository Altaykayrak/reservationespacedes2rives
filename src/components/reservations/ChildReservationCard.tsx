import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ReservationItem } from "./ReservationItem";
import { Tables } from "@/integrations/supabase/types";
import { User } from "lucide-react";

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
    <Card className="overflow-hidden border-gray-100 shadow-sm h-full">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800">{childName}</h3>
              <p className="text-xs text-muted-foreground">{schoolClass}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px]">
            {reservations.length} réservation{reservations.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
      <div className="divide-y divide-gray-50 bg-white">
        {reservations.map((reservation) => (
          <ReservationItem key={reservation.id} reservation={reservation} />
        ))}
      </div>
    </Card>
  );
};