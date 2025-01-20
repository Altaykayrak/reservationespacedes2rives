import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { ReservationBadges } from "@/components/reservations/ReservationBadges";
import { Tables } from "@/integrations/supabase/types";

type ReservationWithChild = Tables<"reservations"> & {
  children: {
    first_name: string;
    last_name: string;
    school_class: string;
  };
};

interface ReservationItemProps {
  reservation: ReservationWithChild;
  onEdit: (reservation: ReservationWithChild) => void;
  onDelete: (id: string) => void;
}

export const ReservationItem = ({
  reservation,
  onEdit,
  onDelete,
}: ReservationItemProps) => {
  return (
    <div className="flex flex-col p-4 border rounded bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="font-medium text-lg">
            {reservation.children?.first_name} {reservation.children?.last_name}
          </p>
          <p className="text-sm text-gray-600">
            Classe: {reservation.children?.school_class}
          </p>
          <p className="text-sm text-gray-600">
            Date: {format(new Date(reservation.reservation_date), "dd/MM/yyyy")}
          </p>
          <ReservationBadges 
            withoutMeal={Boolean(reservation.without_meal)}
            earlyDropoff={Boolean(reservation.early_dropoff)}
          />
        </div>
        <div className="flex gap-2">
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Modifier la réservation"
            onClick={() => onEdit(reservation)}
          >
            <Pencil className="h-4 w-4 text-blue-500" />
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Supprimer la réservation"
            onClick={() => onDelete(reservation.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
};