
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
  const isInitialMount = useRef(true);
  const previousPeriodId = useRef(selectedPeriodId);
  const childSelectChanged = useRef(false);
  const selectionInProgress = useRef(false);

  // Écouter la sélection de période à partir des paramètres de recherche d'URL
  useEffect(() => {
    // Ne mettre à jour que si les paramètres d'URL ont réellement changé pour éviter les boucles
    if (selectionInProgress.current) return;
    
    try {
      const searchParams = new URLSearchParams(location.search);
      const periodId = searchParams.get("periodId");
      
      if (periodId && periodId !== selectedPeriodId) {
        console.log("[ChildSelector] Updating selected period from URL:", periodId);
        setSelectedPeriodId(periodId);
        previousPeriodId.current = periodId;
      }
    } catch (error) {
      console.error("[ChildSelector] Error parsing URL parameters:", error);
    }
  }, [location.search, selectedPeriodId]);

  // Gérer le filtrage des enfants en fonction du type de page et de la période
  const {
    filteredChildren,
    periodInfo,
    classMappings,
    isSummerPeriod,
    isHolidayReservation,
    isTeenHolidayReservation,
    isAdminTeenHolidayReservation
  } = useChildFiltering(children, selectedPeriodId);

  // Gérer la vérification des enfants CM2 pour les périodes d'été
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

  // Gérer la sélection d'un enfant avec protection anti-rebond
  const handleChildSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Empêcher toute propagation du formulaire
    e.preventDefault();
    e.stopPropagation();
    
    const childId = e.target.value;
    if (childId !== selectedChild && !childSelectChanged.current) {
      childSelectChanged.current = true;
      selectionInProgress.current = true;
      console.log("[ChildSelector] Changing selected child to:", childId);
      
      // Utiliser setTimeout pour éviter les boucles de mise à jour d'état
      setTimeout(() => {
        try {
          setSelectedChild(childId);
        } catch (error) {
          console.error("[ChildSelector] Error setting child:", error);
        } finally {
          // Réinitialiser les indicateurs après un bref délai
          setTimeout(() => {
            childSelectChanged.current = false;
            selectionInProgress.current = false;
          }, 150);
        }
      }, 0);
    }
  };

  return (
    <div onClick={e => e.stopPropagation()}>
      <Label htmlFor="child-select">Sélectionner un enfant</Label>
      <select
        id="child-select"
        value={selectedChild}
        onChange={handleChildSelect}
        className="w-full mt-2 rounded-md border border-gray-300 p-2"
        onClick={e => e.stopPropagation()}
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
