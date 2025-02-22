
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ReservationItemProps {
  reservation: WednesdayReservationWithChild | HolidayReservationWithChild;
  onEdit: () => void;
  onDelete: () => void;
}

export const ReservationItem = ({
  reservation,
  onEdit,
  onDelete
}: ReservationItemProps) => {
  const formattedDate = format(
    new Date('wednesday_id' in reservation 
      ? reservation.available_wednesdays.date 
      : reservation.reservation_date
    ),
    "EEEE d MMMM yyyy",
    { locale: fr }
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-lg border">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">
            {reservation.children.last_name} {reservation.children.first_name}
          </h3>
          <Badge variant="outline">{reservation.children.school_class}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formattedDate}
        </p>
        <div className="flex gap-2">
          {reservation.early_dropoff && (
            <Badge variant="secondary">Accueil avant 8h30</Badge>
          )}
          {reservation.without_meal && (
            <Badge variant="secondary">Sans repas</Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer
        </Button>
      </div>
    </div>
  );
};
