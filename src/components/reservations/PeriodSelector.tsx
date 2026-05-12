
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";
import { useEffect, useState, useRef } from "react";
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
  const valueChangeBlocked = useRef(false);

  // Récupérer les mappings de classes pour filtrer les périodes
  const { data: classMappings } = useQuery({
    queryKey: ["class_mappings_teen"],
    queryFn: async () => {
      if (!filterTeenOnly) return null;
      
      // Récupérer TOUS les mappings (catégorie incluse) pour mieux déterminer
      // les périodes sans aucun mapping (à inclure par défaut)
      const { data, error } = await supabase
        .from("holiday_period_class_mappings")
        .select("holiday_period_id, category");
      
      if (error) {
        console.error("Erreur lors de la récupération des mappings:", error);
        throw error;
      }
      
      return data;
    },
    enabled: filterTeenOnly,
    staleTime: 5 * 60 * 1000, // Cache pour 5 minutes
  });

  // Filtrer les périodes lorsque les mappings sont chargés
  useEffect(() => {
    if (filterTeenOnly && classMappings && holidayPeriods) {
      // Extraire les IDs mappés comme adolescents et l'ensemble de tous les IDs mappés
      const teenPeriodIds = classMappings
        .filter((m: any) => m.category === "adolescent")
        .map((m: any) => m.holiday_period_id);
      const allMappedPeriodIds = new Set(classMappings.map((m: any) => m.holiday_period_id));
      
      // Règles spécifiques été
      const includedSummerPeriods = ["ETE-01", "ETE-02", "ETE-03", "ETE-04"];
      const excludedSummerPeriods = ["ETE-05", "ETE-06", "ETE-07", "ETE-08"];
      
      // Périodes d'été à toujours inclure (début d'été)
      const summerPeriods = holidayPeriods.filter(period => 
        period.name && includedSummerPeriods.includes(period.name)
      );
      
      // Périodes avec mapping adolescent explicite (hors été exclu)
      const periodsWithTeenMapping = holidayPeriods.filter(period => 
        teenPeriodIds.includes(period.id) && 
        !(period.name && excludedSummerPeriods.includes(period.name))
      );
      
      // Périodes sans aucun mapping (incluses par défaut pour éviter d'en masquer par erreur)
      const periodsWithoutMappings = holidayPeriods.filter(period => 
        !allMappedPeriodIds.has(period.id) && 
        !(period.name && excludedSummerPeriods.includes(period.name))
      );
      
      // Combiner et dédupliquer
      const uniquePeriods = [
        ...new Map(
          [...periodsWithTeenMapping, ...periodsWithoutMappings, ...summerPeriods]
            .map(item => [item.id, item])
        ).values()
      ];
      
      // Tri: été en ordre (ETE-01..), sinon par date
      const sortedPeriods = [...uniquePeriods].sort((a, b) => {
        const aMatch = a.name?.match(/^(ETE)-(\d+)$/);
        const bMatch = b.name?.match(/^(ETE)-(\d+)$/);
        if (aMatch && bMatch) return parseInt(aMatch[2]) - parseInt(bMatch[2]);
        if (aMatch) return -1;
        if (bMatch) return 1;
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      });
      
      setFilteredPeriods(sortedPeriods);
    } else if (holidayPeriods) {
      // Trier toutes les périodes selon l'ordre spécifique pour les périodes d'été
      const sortedPeriods = [...holidayPeriods].sort((a, b) => {
        const aMatch = a.name?.match(/^(ETE)-(\d+)$/);
        const bMatch = b.name?.match(/^(ETE)-(\d+)$/);
        if (aMatch && bMatch) return parseInt(aMatch[2]) - parseInt(bMatch[2]);
        if (aMatch) return -1;
        if (bMatch) return 1;
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      });
      setFilteredPeriods(sortedPeriods);
    }
  }, [holidayPeriods, classMappings, filterTeenOnly]);

  // Handler sécurisé avec anti-rebond pour éviter les sélections multiples
  const handlePeriodChange = (value: string) => {
    if (valueChangeBlocked.current) return;
    
    console.log("[PeriodSelector] Changement de période sélectionné:", value);
    valueChangeBlocked.current = true;
    
    // Utiliser setTimeout pour éviter les boucles React de mise à jour d'état
    setTimeout(() => {
      try {
        setSelectedPeriod(value);
        console.log("[PeriodSelector] Période mise à jour:", value);
      } catch (error) {
        console.error("[PeriodSelector] Erreur lors du changement de période:", error);
      } finally {
        // Débloquer après un délai pour éviter les mises à jour en cascade
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
