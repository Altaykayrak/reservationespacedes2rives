import { Card } from "@/components/ui/card";
import { ReservationItem } from "./ReservationItem";
import { Tables } from "@/integrations/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";

type ReservationWithChild = Tables<"reservations"> & {
  children: {
    first_name: string;
    last_name: string;
    school_class: string;
  };
};

interface ReservationListProps {
  reservations: ReservationWithChild[] | null;
  onEdit: (reservation: ReservationWithChild) => void;
  onDelete: (id: string) => void;
}

export const ReservationList = ({ 
  reservations,
  onEdit,
  onDelete,
}: ReservationListProps) => {
  if (!reservations || reservations.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">Aucune réservation trouvée</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {reservations?.map((reservation) => (
            <ReservationItem
              key={reservation.id}
              reservation={reservation}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};