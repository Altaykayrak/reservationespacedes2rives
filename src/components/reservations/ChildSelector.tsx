
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
}

export const ChildSelector = ({
  selectedChild,
  setSelectedChild,
  children,
  setSelectedDates,
  onCM2SummerPeriodCheck
}: ChildSelectorProps) => {
  const location = useLocation();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [summerPeriods] = useState<string[]>(["ETE-01", "ETE-02", "ETE-03", "ETE-04"]);
  const changeEventHandled = useRef(false);

  // Listen for period selection from URL search parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const periodId = searchParams.get("periodId");
    if (periodId) {
      console.log("[ChildSelector] selectedPeriodId mis à jour depuis URL à", periodId);
      setSelectedPeriodId(periodId);
    }
  }, [location.search]);

  // Handle child filtering based on page type and period
  const {
    filteredChildren,
    periodInfo,
    classMappings,
    isSummerPeriod,
    isHolidayReservation,
    isTeenHolidayReservation,
    isAdminTeenHolidayReservation,
    isLoading
  } = useChildFiltering(children, selectedPeriodId);

  // Handle CM2 child check for summer periods
  const { showCM2Message } = useCM2ChildCheck(
    selectedChild,
    children,
    selectedPeriodId,
    periodInfo,
    summerPeriods,
    isHolidayReservation,
    isTeenHolidayReservation,
    isAdminTeenHolidayReservation,
    setSelectedDates,
    onCM2SummerPeriodCheck
  );

  // Log pour le débogage
  useEffect(() => {
    console.log("[ChildSelector] Rendu avec:", { 
      selectedChild, 
      selectedPeriodId,
      isSummerPeriod,
      isHolidayReservation,
      filteredChildrenCount: filteredChildren?.length || 0
    });
  }, [selectedChild, selectedPeriodId, isSummerPeriod, isHolidayReservation, filteredChildren]);

  // Fonction pour mettre à jour l'enfant sélectionné sans soumettre le formulaire
  const handleChildChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Empêcher tout comportement de soumission
    e.preventDefault();
    e.stopPropagation();
    
    // Protection contre les déclenchements multiples
    if (changeEventHandled.current) return;
    
    try {
      changeEventHandled.current = true;
      
      const childId = e.target.value;
      console.log("[ChildSelector] Changement d'enfant:", {
        ancien: selectedChild,
        nouveau: childId
      });
      
      // Utiliser requestAnimationFrame pour éviter les problèmes de synchronisation
      window.requestAnimationFrame(() => {
        setSelectedChild(childId);
      });
      
      // Reset le flag après un court délai
      setTimeout(() => {
        changeEventHandled.current = false;
      }, 100);
    } catch (error) {
      console.error("[ChildSelector] Erreur lors du changement d'enfant:", error);
      changeEventHandled.current = false;
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
