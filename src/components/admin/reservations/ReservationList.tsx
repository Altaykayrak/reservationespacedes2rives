import { Card } from "@/components/ui/card";
import { ReservationItem } from "./ReservationItem";
import { Tables } from "@/integrations/supabase/types";

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
  return (
    <Card className="p-6">
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
    </Card>
  );
};