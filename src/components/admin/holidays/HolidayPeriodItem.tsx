
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, School } from "lucide-react";
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
    <div className="p-4 bg-white rounded border shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800 text-base capitalize mb-1">{holiday.name}</h3>
          <p className="text-xs text-gray-600 mb-2">
            Du {format(startDate, "d MMMM yyyy", { locale: fr })} au{" "}
            {format(endDate, "d MMMM yyyy", { locale: fr })}
          </p>
          <div className="flex gap-2 mb-2">
            <Badge variant="outline" className="text-xs">Maternelle: {holiday.max_participants_kindergarten}</Badge>
            <Badge variant="outline" className="text-xs">Primaire: {holiday.max_participants_primary}</Badge>
            <Badge variant="outline" className="text-xs">Adolescents: {holiday.max_participants_teen}</Badge>
          </div>
          <div>
            {hasReservations ? (
              <Badge variant="secondary" className="text-xs">{reservationCount} réservation{reservationCount > 1 ? 's' : ''}</Badge>
            ) : (
              <span className="text-gray-500 text-xs">Aucune réservation</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowClassMappings(true)}
            disabled={hasReservations}
            title={hasReservations ? "Impossible de configurer les classes (des réservations existent)" : "Configurer les classes"}
          >
            <School className="h-4 w-4" />
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
