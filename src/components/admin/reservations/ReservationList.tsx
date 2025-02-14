
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X } from "lucide-react";

interface ReservationListProps {
  reservations: (WednesdayReservationWithChild | HolidayReservationWithChild)[] | null;
  onEdit: (reservation: WednesdayReservationWithChild | HolidayReservationWithChild) => void;
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

  const getReservationDate = (reservation: WednesdayReservationWithChild | HolidayReservationWithChild) => {
    if ('wednesday_id' in reservation) {
      return format(new Date(reservation.available_wednesdays.date), "dd/MM/yyyy", { locale: fr });
    } else {
      return format(new Date(reservation.reservation_date), "dd/MM/yyyy", { locale: fr });
    }
  };

  return (
    <Card className="p-6">
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Classe</TableHead>
              <TableHead>Ville de scolarisation</TableHead>
              <TableHead className="text-center">Avant 8h30</TableHead>
              <TableHead className="text-center">Sans repas</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>{getReservationDate(reservation)}</TableCell>
                <TableCell className="font-medium">{reservation.children?.last_name}</TableCell>
                <TableCell>{reservation.children?.first_name}</TableCell>
                <TableCell>{reservation.children?.school_class}</TableCell>
                <TableCell>{reservation.children?.profile?.school_city}</TableCell>
                <TableCell className="text-center">
                  {reservation.early_dropoff ? (
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {reservation.without_meal ? (
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(reservation)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => onDelete(reservation.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};
