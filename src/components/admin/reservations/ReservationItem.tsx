
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";

interface ReservationItemProps {
  reservation: WednesdayReservationWithChild | HolidayReservationWithChild;
  onEdit: (reservation: WednesdayReservationWithChild | HolidayReservationWithChild) => void;
  onDelete: (id: string) => void;
}

export const ReservationItem = ({
  reservation,
  onEdit,
  onDelete,
}: ReservationItemProps) => {
  const getReservationDate = () => {
    if ('wednesday_id' in reservation) {
      return format(new Date(reservation.available_wednesdays.date), "dd/MM/yyyy", { locale: fr });
    } else {
      return format(new Date(reservation.reservation_date), "dd/MM/yyyy", { locale: fr });
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-1.5 border-b hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">
          {reservation.children?.first_name} {reservation.children?.last_name}
        </span>
        <span className="text-gray-500">
          ({reservation.children?.school_class})
        </span>
        <span className="text-gray-400">•</span>
        <span>{getReservationDate()}</span>
        {reservation.without_meal && (
          <>
            <span className="text-gray-400">•</span>
            <span className="text-orange-600">Sans repas</span>
          </>
        )}
        {reservation.early_dropoff && (
          <>
            <span className="text-gray-400">•</span>
            <span className="text-blue-600">Arrivée avant 8h30</span>
          </>
        )}
      </div>
      <div className="flex gap-1">
        <button 
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Modifier la réservation"
          onClick={() => onEdit(reservation)}
        >
          <Pencil className="h-3.5 w-3.5 text-blue-500" />
        </button>
        <button 
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Supprimer la réservation"
          onClick={() => onDelete(reservation.id)}
        >
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </button>
      </div>
    </div>
  );
};
