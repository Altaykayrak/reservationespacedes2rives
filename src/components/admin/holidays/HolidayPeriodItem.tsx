
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, School } from "lucide-react";
import { useState } from "react";
import EditHolidayClassMappings from "./EditHolidayClassMappings";

type HolidayPeriod = Tables<"available_holiday_periods">;

interface HolidayPeriodItemProps {
  holiday: HolidayPeriod;
  reservationCount?: number;
  onEdit: () => void;
  onDelete: () => void;
  onMappingChange?: () => void;
}

const HolidayPeriodItem = ({ 
  holiday, 
  reservationCount = 0, 
  onEdit, 
  onDelete,
  onMappingChange
}: HolidayPeriodItemProps) => {
  const [showClassMappings, setShowClassMappings] = useState(false);
  const startDate = new Date(holiday.start_date);
  const endDate = new Date(holiday.end_date);

  const hasReservations = reservationCount > 0;

  const handleMappingSuccess = () => {
    if (onMappingChange) onMappingChange();
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{holiday.name}</h3>
          <p className="text-sm text-gray-600">
            Du {format(startDate, "d MMMM yyyy", { locale: fr })} au{" "}
            {format(endDate, "d MMMM yyyy", { locale: fr })}
          </p>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline">Maternelle: {holiday.max_participants_kindergarten}</Badge>
            <Badge variant="outline">Primaire: {holiday.max_participants_primary}</Badge>
            <Badge variant="outline">Adolescents: {holiday.max_participants_teen}</Badge>
          </div>
          {reservationCount !== undefined && (
            <p className="text-sm mt-1">
              {hasReservations ? (
                <Badge variant="secondary">{reservationCount} réservation{reservationCount > 1 ? 's' : ''}</Badge>
              ) : (
                <span className="text-gray-500">Aucune réservation</span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowClassMappings(true)}
            title="Configurer les classes"
          >
            <School className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant={hasReservations ? "outline" : "destructive"}
            size="icon"
            onClick={onDelete}
            disabled={hasReservations}
            title={hasReservations ? "Impossible de supprimer (des réservations existent)" : "Supprimer la période"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EditHolidayClassMappings
        open={showClassMappings}
        onOpenChange={setShowClassMappings}
        holiday={holiday}
        onSuccess={handleMappingSuccess}
      />
    </div>
  );
};

export default HolidayPeriodItem;
