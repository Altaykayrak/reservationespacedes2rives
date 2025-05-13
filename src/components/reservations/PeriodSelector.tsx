
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

interface PeriodSelectorProps {
  selectedPeriod: string;
  setSelectedPeriod: (periodId: string) => void;
  holidayPeriods?: Tables<"available_holiday_periods">[] | null;
  filterTeenOnly?: boolean;
  updateUrlWithoutRefresh?: boolean;
}

export const PeriodSelector = ({
  selectedPeriod,
  setSelectedPeriod,
  holidayPeriods,
  filterTeenOnly = false,
  updateUrlWithoutRefresh = false
}: PeriodSelectorProps) => {
  const [filteredPeriods, setFilteredPeriods] = useState<Tables<"available_holiday_periods">[] | null | undefined>(holidayPeriods);
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);
  const selectEventHandled = useRef(false);
  const isFormSubmitHandled = useRef(false);
  
  // Récupérer les mappings de classes pour filtrer les périodes
  const { data: classMappings } = useQuery({
    queryKey: ["class_mappings_teen"],
    queryFn: async () => {
      if (!filterTeenOnly) return null;
      
      console.log("[PeriodSelector] Récupération des mappings de classes pour ados");
      
      const { data, error } = await supabase
        .from("holiday_period_class_mappings")
        .select("holiday_period_id")
        .eq("category", "adolescent");
      
      if (error) {
        console.error("[PeriodSelector] Erreur lors de la récupération des mappings:", error);
        throw error;
      }
      
      console.log("[PeriodSelector] Mappings récupérés:", data?.length);
      return data;
    },
    enabled: filterTeenOnly
  });

  // Filtrer les périodes lorsque les mappings sont chargés
  useEffect(() => {
    if (filterTeenOnly && classMappings && holidayPeriods) {
      console.log("[PeriodSelector] Filtrage des périodes pour les ados");
      
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
      
      console.log("[PeriodSelector] Périodes filtrées pour les ados:", uniquePeriods.length);
      setFilteredPeriods(uniquePeriods);
    } else {
      console.log("[PeriodSelector] Utilisation des périodes non filtrées");
      setFilteredPeriods(holidayPeriods);
    }
  }, [holidayPeriods, classMappings, filterTeenOnly]);

  // Empêcher tout comportement de soumission de formulaire
  useEffect(() => {
    if (isFormSubmitHandled.current) return;
    
    const handleFormSubmit = (e: SubmitEvent) => {
      console.log("[PeriodSelector] Interception d'une soumission de formulaire");
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    // Capture all form submissions
    document.addEventListener('submit', handleFormSubmit, true);
    isFormSubmitHandled.current = true;
    
    return () => {
      document.removeEventListener('submit', handleFormSubmit, true);
    };
  }, []);

  // Gérer le changement de période avec protection contre les événements multiples
  const handlePeriodChange = (newPeriodId: string) => {
    if (selectEventHandled.current) {
      console.log("[PeriodSelector] Événement déjà traité, ignoré");
      return;
    }
    
    try {
      // Marquer l'événement comme traité pour éviter les doublons
      selectEventHandled.current = true;
      
      console.log("[PeriodSelector] Changement de période:", { 
        ancien: selectedPeriod,
        nouveau: newPeriodId,
        url_update: updateUrlWithoutRefresh
      });
      
      // Mettre à jour l'état local via callback pour garantir la fraîcheur
      setSelectedPeriod(newPeriodId);
      
      // Mettre à jour l'URL sans recharger la page si demandé
      if (updateUrlWithoutRefresh) {
        const newParams = new URLSearchParams(searchParams.toString());
        if (newPeriodId) {
          newParams.set("periodId", newPeriodId);
        } else {
          newParams.delete("periodId");
        }
        
        // Utiliser requestAnimationFrame pour s'assurer que la modification d'URL est asynchrone
        window.requestAnimationFrame(() => {
          console.log("[PeriodSelector] Mise à jour de l'URL avec periodId =", newPeriodId);
          setSearchParams(newParams, { replace: true });
        });
      }
      
      // Reset le flag après un court délai
      setTimeout(() => {
        selectEventHandled.current = false;
      }, 100);
    } catch (error) {
      console.error("[PeriodSelector] Erreur lors du changement de période:", error);
      selectEventHandled.current = false;
    }
  };

  // Initialiser depuis les paramètres d'URL au chargement
  useEffect(() => {
    if (!isInitialMount.current) {
      return; // Ne s'exécute qu'une fois au montage
    }
    
    if (updateUrlWithoutRefresh) {
      const periodIdFromUrl = searchParams.get("periodId");
      console.log("[PeriodSelector] DEBUG: periodId depuis URL =", periodIdFromUrl, "selectedPeriod =", selectedPeriod);
      
      if (periodIdFromUrl && periodIdFromUrl !== selectedPeriod) {
        console.log("[PeriodSelector] Mise à jour initiale de selectedPeriod depuis URL à", periodIdFromUrl);
        setSelectedPeriod(periodIdFromUrl);
      } else if (selectedPeriod) {
        // Si selectedPeriod a une valeur mais que l'URL n'en a pas, mettre à jour l'URL
        console.log("[PeriodSelector] Mise à jour de l'URL depuis selectedPeriod initial =", selectedPeriod);
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("periodId", selectedPeriod);
        setSearchParams(newParams, { replace: true });
      }
      
      isInitialMount.current = false;
    }
  }, [searchParams, setSelectedPeriod, selectedPeriod, updateUrlWithoutRefresh, setSearchParams]);

  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      <label className="text-sm font-medium">Sélectionner une période</label>
      <Select 
        value={selectedPeriod || ""} 
        onValueChange={handlePeriodChange}
      >
        <SelectTrigger 
          className="w-full" 
          type="button"
          onClick={(e) => {
            // Bloquer tout événement qui pourrait causer une soumission de formulaire
            e.preventDefault();
            e.stopPropagation();
            console.log("[PeriodSelector] Clic sur le déclencheur SelectTrigger");
          }}
        >
          <SelectValue placeholder="Choisir une période" />
        </SelectTrigger>
        <SelectContent onClick={(e) => e.stopPropagation()}>
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
