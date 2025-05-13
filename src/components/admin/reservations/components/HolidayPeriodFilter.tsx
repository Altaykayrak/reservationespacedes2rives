
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useCallback, memo } from "react";

interface HolidayPeriod {
  id: string;
  name: string;
}

interface HolidayPeriodFilterProps {
  selectedPeriod: string;
  setSelectedPeriod: (periodId: string) => void;
  availablePeriods: HolidayPeriod[];
}

export const HolidayPeriodFilter = memo(({
  selectedPeriod,
  setSelectedPeriod,
  availablePeriods,
}: HolidayPeriodFilterProps) => {
  // Optimiser le gestionnaire pour éviter les rechargements
  const handlePeriodChange = useCallback((value: string) => {
    if (value !== selectedPeriod) {
      console.log("Changing period filter to:", value);
      setSelectedPeriod(value);
    }
  }, [selectedPeriod, setSelectedPeriod]);

  return (
    <div className="mb-4 flex items-center gap-2">
      <Calendar className="h-5 w-5 text-gray-500" />
      <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Filtrer par période" />
        </SelectTrigger>
        <SelectContent className="bg-white z-[100]">
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
});

HolidayPeriodFilter.displayName = "HolidayPeriodFilter";
