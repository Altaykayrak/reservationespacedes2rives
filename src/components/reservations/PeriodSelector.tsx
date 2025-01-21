import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";

interface PeriodSelectorProps {
  selectedPeriod: string;
  setSelectedPeriod: (periodId: string) => void;
  holidayPeriods?: Tables<"available_holiday_periods">[] | null;
}

export const PeriodSelector = ({
  selectedPeriod,
  setSelectedPeriod,
  holidayPeriods
}: PeriodSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Sélectionner une période</label>
      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choisir une période" />
        </SelectTrigger>
        <SelectContent>
          {holidayPeriods?.map((period) => (
            <SelectItem key={period.id} value={period.id}>
              {format(new Date(period.start_date), "d MMMM yyyy", { locale: fr })} au{" "}
              {format(new Date(period.end_date), "d MMMM yyyy", { locale: fr })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};