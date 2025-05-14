
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
  // Fonction pour trier les périodes de vacances
  const sortedPeriods = [...availablePeriods].sort((a, b) => {
    // Extraire les préfixes ETE-XX
    const aMatch = a.name?.match(/^(ETE)-(\d+)$/);
    const bMatch = b.name?.match(/^(ETE)-(\d+)$/);
    
    // Si les deux périodes sont des périodes d'été
    if (aMatch && bMatch) {
      // Comparer les numéros de périodes d'été
      return parseInt(aMatch[2]) - parseInt(bMatch[2]);
    }
    
    // Si seulement a est une période d'été, la mettre en premier
    if (aMatch) return -1;
    
    // Si seulement b est une période d'été, la mettre en premier
    if (bMatch) return 1;
    
    // Tri alphabétique par défaut pour les autres périodes
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="mb-4 flex items-center gap-2">
      <Calendar className="h-5 w-5 text-gray-500" />
      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Filtrer par période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les périodes</SelectItem>
          {sortedPeriods.map((period) => (
            <SelectItem key={period.id} value={period.id}>
              {period.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
