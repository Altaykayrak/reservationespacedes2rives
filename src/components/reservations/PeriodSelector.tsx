
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";
import { useEffect, useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { customToast } from "@/hooks/use-toast";

interface PeriodSelectorProps {
  selectedPeriod: string;
  setSelectedPeriod: (periodId: string) => void;
  holidayPeriods?: Tables<"available_holiday_periods">[] | null;
  filterTeenOnly?: boolean;
  updateUrlWithoutRefresh?: boolean;
  initialPeriodId?: string;
}

export const PeriodSelector = ({
  selectedPeriod,
  setSelectedPeriod,
  holidayPeriods,
  filterTeenOnly = false,
  updateUrlWithoutRefresh = false,
  initialPeriodId
}: PeriodSelectorProps) => {
  const [filteredPeriods, setFilteredPeriods] = useState<Tables<"available_holiday_periods">[] | null | undefined>(holidayPeriods);
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);
  const selectEventHandled = useRef(false);
  const isFormSubmitHandled = useRef(false);
  const urlUpdatePending = useRef(false);
  const initializationComplete = useRef(false);
  
  // Log initial props for debugging
  useEffect(() => {
    console.log("[PeriodSelector] Initialization with props:", { 
      selectedPeriod, 
      holidayPeriodsCount: holidayPeriods?.length,
      filterTeenOnly,
      updateUrlWithoutRefresh,
      initialPeriodId
    });
  }, []);

  // Récupérer les mappings de classes pour filtrer les périodes
  const { data: classMappings, isLoading: isMappingsLoading } = useQuery({
    queryKey: ["class_mappings_teen"],
    queryFn: async () => {
      if (!filterTeenOnly) return null;
      
      console.log("[PeriodSelector] Récupération des mappings de classes pour ados");
      
      try {
        const { data, error } = await supabase
          .from("holiday_period_class_mappings")
          .select("holiday_period_id")
          .eq("category", "adolescent");
        
        if (error) {
          console.error("[PeriodSelector] Erreur lors de la récupération des mappings:", error);
          customToast.error("Impossible de charger les informations de période");
          return [];
        }
        
        console.log("[PeriodSelector] Mappings récupérés:", data?.length);
        return data || [];
      } catch (err) {
        console.error("[PeriodSelector] Exception:", err);
        customToast.error("Erreur système lors du chargement des périodes");
        return [];
      }
    },
    enabled: filterTeenOnly
  });

  // Filtrer les périodes lorsque les mappings sont chargés
  useEffect(() => {
    console.log("[PeriodSelector] Filtrage des périodes:", { 
      holidayPeriodsCount: holidayPeriods?.length,
      classMappingsCount: classMappings?.length,
      filterTeenOnly
    });
    
    if (!holidayPeriods) {
      console.log("[PeriodSelector] Pas de périodes disponibles");
      setFilteredPeriods([]);
      return;
    }
    
    if (filterTeenOnly && classMappings) {
      console.log("[PeriodSelector] Filtrage des périodes pour les ados");
      
      try {
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
      } catch (err) {
        console.error("[PeriodSelector] Erreur lors du filtrage des périodes:", err);
        setFilteredPeriods(holidayPeriods);
      }
    } else {
      console.log("[PeriodSelector] Utilisation des périodes non filtrées:", holidayPeriods.length);
      setFilteredPeriods(holidayPeriods);
    }
  }, [holidayPeriods, classMappings, filterTeenOnly]);

  // Empêcher tout comportement de soumission de formulaire
  useEffect(() => {
    if (isFormSubmitHandled.current) return;
    
    const handleFormSubmit = (e: Event) => {
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
  const handlePeriodChange = useCallback((newPeriodId: string) => {
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
      if (updateUrlWithoutRefresh && !urlUpdatePending.current) {
        urlUpdatePending.current = true;
        
        // Utiliser setTimeout pour assurer une exécution asynchrone
        setTimeout(() => {
          try {
            const newParams = new URLSearchParams(searchParams.toString());
            if (newPeriodId) {
              newParams.set("periodId", newPeriodId);
            } else {
              newParams.delete("periodId");
            }
            
            console.log("[PeriodSelector] Mise à jour de l'URL avec periodId =", newPeriodId);
            setSearchParams(newParams, { replace: true });
          } catch (err) {
            console.error("[PeriodSelector] Erreur lors de la mise à jour de l'URL:", err);
          } finally {
            urlUpdatePending.current = false;
          }
        }, 10);
      }
      
      // Reset le flag après un court délai
      setTimeout(() => {
        selectEventHandled.current = false;
      }, 100);
    } catch (error) {
      console.error("[PeriodSelector] Erreur lors du changement de période:", error);
      selectEventHandled.current = false;
    }
  }, [selectedPeriod, setSelectedPeriod, updateUrlWithoutRefresh, searchParams, setSearchParams]);

  // Initialisation forcée - exécuté une seule fois lorsque les données sont disponibles
  useEffect(() => {
    // Ne s'exécute qu'une fois quand filteredPeriods est disponible
    if (initializationComplete.current || !filteredPeriods || filteredPeriods.length === 0) {
      return;
    }

    console.log("[PeriodSelector] Initialisation forcée avec données disponibles");
    
    const periodIdFromUrl = searchParams.get("periodId");
    const validUrlPeriod = periodIdFromUrl && filteredPeriods.some(p => p.id === periodIdFromUrl);
    const validInitialPeriod = initialPeriodId && filteredPeriods.some(p => p.id === initialPeriodId);
    
    console.log("[PeriodSelector] Options d'initialisation:", {
      periodIdFromUrl,
      validUrlPeriod,
      initialPeriodId,
      validInitialPeriod,
      selectedPeriod
    });

    // Priorité: URL > initialPeriodId > selectedPeriod > première période
    let finalPeriodId: string;
    
    if (validUrlPeriod) {
      finalPeriodId = periodIdFromUrl as string;
      console.log("[PeriodSelector] Utilisation periodId depuis URL:", finalPeriodId);
    } else if (validInitialPeriod) {
      finalPeriodId = initialPeriodId as string;
      console.log("[PeriodSelector] Utilisation initialPeriodId:", finalPeriodId);
    } else if (selectedPeriod && filteredPeriods.some(p => p.id === selectedPeriod)) {
      finalPeriodId = selectedPeriod;
      console.log("[PeriodSelector] Conservation du selectedPeriod actuel:", finalPeriodId);
    } else {
      finalPeriodId = filteredPeriods[0].id;
      console.log("[PeriodSelector] Utilisation de la première période disponible:", finalPeriodId);
    }

    // Appliquer la période choisie et mettre à jour l'URL si nécessaire
    if (finalPeriodId !== selectedPeriod) {
      console.log("[PeriodSelector] Mise à jour du selectedPeriod:", finalPeriodId);
      setSelectedPeriod(finalPeriodId);
    }
    
    if (updateUrlWithoutRefresh && finalPeriodId !== periodIdFromUrl) {
      try {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("periodId", finalPeriodId);
        console.log("[PeriodSelector] Mise à jour de l'URL avec periodId =", finalPeriodId);
        setSearchParams(newParams, { replace: true });
      } catch (err) {
        console.error("[PeriodSelector] Erreur lors de la mise à jour de l'URL:", err);
      }
    }
    
    initializationComplete.current = true;
    isInitialMount.current = false;
    
  }, [filteredPeriods, initialPeriodId, searchParams, setSearchParams, selectedPeriod, setSelectedPeriod, updateUrlWithoutRefresh]);

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
          {!filteredPeriods || filteredPeriods.length === 0 ? (
            <div className="p-2 text-center text-sm text-gray-500">
              {isMappingsLoading ? "Chargement..." : "Aucune période disponible"}
            </div>
          ) : (
            filteredPeriods.map((period) => (
              <SelectItem key={period.id} value={period.id}>
                {format(new Date(period.start_date), "d MMMM yyyy", { locale: fr })} au{" "}
                {format(new Date(period.end_date), "d MMMM yyyy", { locale: fr })}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
