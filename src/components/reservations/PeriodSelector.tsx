import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";
import { useState, useRef, useEffect } from "react";

interface PeriodSelectorProps {
  selectedPeriod: string;
  setSelectedPeriod: (periodId: string) => void;
  holidayPeriods?: Tables<"available_holiday_periods">[] | null;
  filterTeenOnly?: boolean;
}

export const PeriodSelector = ({
  selectedPeriod,
  setSelectedPeriod,
  holidayPeriods,
  filterTeenOnly = false
}: PeriodSelectorProps) => {
  const [filteredPeriods, setFilteredPeriods] = useState<Tables<"available_holiday_periods">[] | null | undefined>(holidayPeriods);
  const valueChangeBlocked = useRef(false);

  useEffect(() => {
    if (!holidayPeriods) return;

    let periods = [...holidayPeriods];

    if (filterTeenOnly) {
      periods = periods.filter(period => ((period as any).max_participants_teen ?? 0) > 0);
    }

    periods.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

    setFilteredPeriods(periods);
  }, [holidayPeriods, filterTeenOnly]);

  const handlePeriodChange = (value: string) => {
    if (valueChangeBlocked.current) return;

    valueChangeBlocked.current = true;
    setTimeout(() => {
      try {
        setSelectedPeriod(value);
      } catch (error) {
        console.error("[PeriodSelector] Erreur lors du changement de période:", error);
      } finally {
        setTimeout(() => {
          valueChangeBlocked.current = false;
        }, 100);
      }
    }, 0);
  };

  return (
    <div className="space-y-2" onClick={e => e.stopPropagation()}>
      <label className="text-sm font-medium">Sélectionner une période</label>
      <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choisir une période" />
        </SelectTrigger>
        <SelectContent>
          {filteredPeriods?.map((period) => (
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
