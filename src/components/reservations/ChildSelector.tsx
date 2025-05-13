
import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";
import { useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { CM2SummerAlert } from "./CM2SummerAlert";
import { useChildFiltering } from "./hooks/useChildFiltering";
import { useCM2ChildCheck } from "./hooks/useCM2ChildCheck";

interface ChildSelectorProps {
  selectedChild: string;
  setSelectedChild: (childId: string) => void;
  children?: Tables<"children">[] | null;
  setSelectedDates?: (dates: any[]) => void;
  onCM2SummerPeriodCheck?: (isInSummerPeriod: boolean) => void;
  selectedPeriodId?: string;
}

export const ChildSelector = ({
  selectedChild,
  setSelectedChild,
  children,
  setSelectedDates,
  onCM2SummerPeriodCheck,
  selectedPeriodId = ""
}: ChildSelectorProps) => {
  const location = useLocation();
  const [summerPeriods] = useState<string[]>(["ETE-01", "ETE-02", "ETE-03", "ETE-04"]);
  const changeEventHandled = useRef(false);
  const previousSelectedChild = useRef<string | null>(null);
  const previousPeriodId = useRef<string | null>(null);
  const initialRenderComplete = useRef(false);
  const selectChangeInProgress = useRef(false);

  // Éviter tout traitement pendant le premier rendu
  useEffect(() => {
    initialRenderComplete.current = true;
    
    // Nettoyer lors du démontage
    return () => {
      initialRenderComplete.current = false;
    };
  }, []);

  // Suivre les changements de période et d'enfant
  useEffect(() => {
    if (selectedPeriodId && selectedPeriodId !== previousPeriodId.current) {
      console.log("[ChildSelector] selectedPeriodId updated:", selectedPeriodId, "previous:", previousPeriodId.current);
      previousPeriodId.current = selectedPeriodId;
    }
    
    if (selectedChild !== previousSelectedChild.current) {
      previousSelectedChild.current = selectedChild;
    }
  }, [selectedPeriodId, selectedChild]);

  // Filtrage des enfants basé sur le type de page et la période
  const {
    filteredChildren,
    periodInfo,
    classMappings,
    isSummerPeriod,
    isHolidayReservation,
    isTeenHolidayReservation,
    isAdminTeenHolidayReservation,
    isLoading
  } = useChildFiltering(children, selectedPeriodId || "");

  // Gestion des enfants CM2 pour les périodes d'été
  const { showCM2Message } = useCM2ChildCheck(
    selectedChild,
    children,
    selectedPeriodId || "",
    periodInfo,
    summerPeriods,
    isHolidayReservation,
    isTeenHolidayReservation,
    isAdminTeenHolidayReservation,
    setSelectedDates,
    onCM2SummerPeriodCheck
  );

  // Réduire les logs - uniquement lors des changements significatifs
  useEffect(() => {
    if (initialRenderComplete.current) {
      console.log("[ChildSelector] État actuel:", { 
        selectedChild, 
        selectedPeriodId,
        isSummerPeriod,
        isHolidayReservation,
        filteredChildrenCount: filteredChildren?.length || 0,
        periodsInfo: periodInfo ? "loaded" : "undefined",
        classMappings: classMappings ? "loaded" : "undefined"
      });
    }
  }, [selectedChild, selectedPeriodId, isSummerPeriod, isHolidayReservation, filteredChildren, periodInfo, classMappings]);

  // Fonction pour mettre à jour l'enfant sélectionné sans soumettre le formulaire
  const handleChildChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Empêcher tout comportement de soumission
    e.preventDefault();
    e.stopPropagation();
    
    // Protection contre les déclenchements multiples avec 3 mécanismes
    if (changeEventHandled.current || selectChangeInProgress.current || !initialRenderComplete.current) return;
    
    try {
      changeEventHandled.current = true;
      selectChangeInProgress.current = true;
      
      const childId = e.target.value;
      
      // Ne pas mettre à jour si la valeur est la même
      if (childId === selectedChild) {
        changeEventHandled.current = false;
        selectChangeInProgress.current = false;
        return;
      }
      
      console.log("[ChildSelector] Changement d'enfant:", {
        ancien: selectedChild,
        nouveau: childId
      });
      
      // Définir directement sans animation frame pour éviter une boucle potentielle
      setSelectedChild(childId);
    } catch (error) {
      console.error("[ChildSelector] Erreur lors du changement d'enfant:", error);
    } finally {
      // Reset des flags après un court délai, quoi qu'il arrive
      setTimeout(() => {
        changeEventHandled.current = false;
        selectChangeInProgress.current = false;
      }, 100);
    }
  };

  if (isLoading) {
    return (
      <div className="relative">
        <Label htmlFor="child-select">Sélectionner un enfant</Label>
        <div className="w-full mt-2 p-2 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
          <span className="text-sm text-gray-500">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()} className="relative">
      <Label htmlFor="child-select">Sélectionner un enfant</Label>
      <select
        id="child-select"
        value={selectedChild}
        onChange={handleChildChange}
        className="w-full mt-2 rounded-md border border-gray-300 p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <option value="">Choisir un enfant</option>
        {filteredChildren?.length ? (
          filteredChildren.map((child) => (
            <option 
              key={child.id} 
              value={child.id}
            >
              {child.last_name} {child.first_name} ({child.school_class})
            </option>
          ))
        ) : (
          <option value="" disabled>Aucun enfant éligible trouvé</option>
        )}
      </select>
      
      <CM2SummerAlert show={showCM2Message} />
    </div>
  );
};
