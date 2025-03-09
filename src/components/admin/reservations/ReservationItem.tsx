
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ReservationItemProps {
  reservation: WednesdayReservationWithChild | HolidayReservationWithChild;
  onEdit: () => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelectionChange: (isSelected: boolean) => void;
}

export const ReservationItem = ({
  reservation,
  onEdit,
  onDelete,
  isSelected,
  onSelectionChange
}: ReservationItemProps) => {
  const formattedDate = format(
    new Date('wednesday_id' in reservation 
      ? reservation.available_wednesdays.date 
      : reservation.reservation_date
    ),
    "dd/MM/yyyy",
    { locale: fr }
  );

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 overflow-hidden">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={onSelectionChange}
          aria-label="Sélectionner cette réservation"
        />
        <div className="font-medium truncate">
          {reservation.children.last_name} {reservation.children.first_name}
        </div>
        <Badge variant="outline" className="whitespace-nowrap">{reservation.children.school_class}</Badge>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {formattedDate}
        </div>
        <div className="flex gap-1 flex-wrap">
          {reservation.early_dropoff && (
            <Badge variant="secondary" className="text-xs">Accueil avant 8h30</Badge>
          )}
          {reservation.without_meal && (
            <Badge variant="secondary" className="text-xs">Sans repas</Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="whitespace-nowrap"
        >
          <Edit className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Modifier</span>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="whitespace-nowrap"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Supprimer</span>
        </Button>
      </div>
    </div>
  );
};
