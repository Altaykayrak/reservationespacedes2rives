
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface HolidayPeriod {
  id: string;
  name: string;
}

interface HolidayPeriodFilterProps {
  selectedPeriod: string;
  setSelectedPeriod: (periodId: string) => void;
  availablePeriods: HolidayPeriod[];
}

export const HolidayPeriodFilter = ({
  selectedPeriod,
  setSelectedPeriod,
  availablePeriods,
}: HolidayPeriodFilterProps) => {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Calendar className="h-5 w-5 text-gray-500" />
      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Filtrer par période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les périodes</SelectItem>
          {availablePeriods.map((period) => (
            <SelectItem key={period.id} value={period.id}>
              {period.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
