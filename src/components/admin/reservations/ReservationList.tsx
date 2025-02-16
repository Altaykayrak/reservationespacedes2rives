
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";
import { ReservationItem } from "./ReservationItem";

interface ReservationListProps {
  reservations: (WednesdayReservationWithChild | HolidayReservationWithChild)[] | null;
  onEdit: (reservation: WednesdayReservationWithChild | HolidayReservationWithChild) => void;
  onDelete: (data: { id: string, type: 'wednesday' | 'holiday' }) => void;
}

export const ReservationList = ({
  reservations,
  onEdit,
  onDelete,
}: ReservationListProps) => {
  if (!reservations || reservations.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-4">
        Aucune réservation trouvée
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <ReservationItem
          key={reservation.id}
          reservation={reservation}
          onEdit={() => onEdit(reservation)}
          onDelete={() => {
            const type = 'wednesday_id' in reservation ? 'wednesday' : 'holiday';
            onDelete({ id: reservation.id, type });
          }}
        />
      ))}
    </div>
  );
};
