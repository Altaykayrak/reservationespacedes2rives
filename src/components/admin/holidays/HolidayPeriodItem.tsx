import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import DeleteHolidayDialog from "./DeleteHolidayDialog";

interface HolidayPeriod {
  id: string;
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
    <div className="flex items-center justify-between p-4 border rounded">
      <div>
        <p className="font-medium">
          Du {new Date(holiday.start_date).toLocaleDateString("fr-FR")} au{" "}
          {new Date(holiday.end_date).toLocaleDateString("fr-FR")}
        </p>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Maternelle: {holiday.max_participants_kindergarten} participants</p>
          <p>Primaire: {holiday.max_participants_primary} participants</p>
          <p>Adolescent: {holiday.max_participants_teen} participants</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={() => onEdit(holiday)}>
          <Edit className="h-4 w-4" />
        </Button>
        <DeleteHolidayDialog
          onDelete={() => onDelete(holiday.id, holiday.start_date, holiday.end_date)}
        />
      </div>
    </div>
  );
};

export default HolidayPeriodItem;