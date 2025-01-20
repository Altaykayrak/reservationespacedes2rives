import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import DeleteHolidayDialog from "./DeleteHolidayDialog";

interface HolidayPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
  max_participants_teen: number;
}

interface HolidayPeriodItemProps {
  holiday: HolidayPeriod;
  onEdit: (holiday: HolidayPeriod) => void;
  onDelete: (id: string, startDate: string, endDate: string) => void;
}

const HolidayPeriodItem = ({ holiday, onEdit, onDelete }: HolidayPeriodItemProps) => {
  return (
    <div className="flex items-center justify-between p-2 border rounded">
      <div className="space-y-1">
        <p className="font-medium text-sm">{holiday.name}</p>
        <p className="text-sm text-gray-600">
          Du {new Date(holiday.start_date).toLocaleDateString("fr-FR")} au{" "}
          {new Date(holiday.end_date).toLocaleDateString("fr-FR")}
        </p>
        <div className="text-xs text-gray-600 flex gap-3">
          <span>Maternelle: {holiday.max_participants_kindergarten}</span>
          <span>Primaire: {holiday.max_participants_primary}</span>
          <span>Adolescent: {holiday.max_participants_teen}</span>
        </div>
      </div>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={() => onEdit(holiday)}>
          <Edit className="h-3 w-3" />
        </Button>
        <DeleteHolidayDialog
          onDelete={() => onDelete(holiday.id, holiday.start_date, holiday.end_date)}
        />
      </div>
    </div>
  );
};

export default HolidayPeriodItem;