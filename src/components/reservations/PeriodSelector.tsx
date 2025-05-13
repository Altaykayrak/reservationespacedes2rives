
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Récupérer les mappings de classes pour filtrer les périodes
  const { data: classMappings } = useQuery({
    queryKey: ["class_mappings_teen"],
    queryFn: async () => {
      if (!filterTeenOnly) return null;
      
      const { data, error } = await supabase
        .from("holiday_period_class_mappings")
        .select("holiday_period_id")
        .eq("category", "adolescent");
      
      if (error) {
        console.error("Erreur lors de la récupération des mappings:", error);
        throw error;
      }
      
      return data;
    },
    enabled: filterTeenOnly
  });

  // Filtrer les périodes lorsque les mappings sont chargés
  useEffect(() => {
    if (filterTeenOnly && classMappings && holidayPeriods) {
      // Extraire les IDs de période qui ont des classes mappées comme adolescents
      const teenPeriodIds = classMappings.map(mapping => mapping.holiday_period_id);
      
      // Période d'été spécifique pour les CM2 (uniquement inclure ETE-01 à ETE-04)
      const includedSummerPeriods = ["ETE-01", "ETE-02", "ETE-03", "ETE-04"];
      const excludedSummerPeriods = ["ETE-05", "ETE-06", "ETE-07", "ETE-08"];
      
      const summerPeriods = holidayPeriods.filter(period => 
        period.name && includedSummerPeriods.includes(period.name)
      );
      
      // Périodes avec mapping adolescent (en excluant les périodes non désirées)
      const periodsWithTeenMapping = holidayPeriods.filter(period => 
        teenPeriodIds.includes(period.id) && 
        !(period.name && excludedSummerPeriods.includes(period.name))
      );
      
      // Combiner et éliminer les doublons
      const uniquePeriods = [...new Map([...periodsWithTeenMapping, ...summerPeriods].map(item => [item.id, item])).values()];
      
      setFilteredPeriods(uniquePeriods);
    } else {
      setFilteredPeriods(holidayPeriods);
    }
  }, [holidayPeriods, classMappings, filterTeenOnly]);

  // Gestionnaire d'événements personnalisé pour la sélection de période
  const handlePeriodChange = (value: string) => {
    // Éviter les actions par défaut du navigateur
    setSelectedPeriod(value);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Sélectionner une période</label>
      <Select value={selectedPeriod || ""} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choisir une période" />
        </SelectTrigger>
        <SelectContent>
          {filteredPeriods?.length ? (
            filteredPeriods.map((period) => (
              <SelectItem key={period.id} value={period.id}>
                {format(new Date(period.start_date), "d MMMM yyyy", { locale: fr })} au{" "}
                {format(new Date(period.end_date), "d MMMM yyyy", { locale: fr })}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="loading" disabled>Chargement des périodes...</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
