
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

  // Écouter la sélection de période à partir des paramètres de recherche d'URL
  useEffect(() => {
    // Ne mettre à jour que si les paramètres d'URL ont réellement changé pour éviter les boucles
    const searchParams = new URLSearchParams(location.search);
    const periodId = searchParams.get("periodId");
    
    if (periodId && periodId !== selectedPeriodId) {
      console.log("[ChildSelector] Updating selected period from URL:", periodId);
      setSelectedPeriodId(periodId);
      previousPeriodId.current = periodId;
    }
  }, [location.search]);

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
    const childId = e.target.value;
    if (childId !== selectedChild && !childSelectChanged.current) {
      childSelectChanged.current = true;
      console.log("[ChildSelector] Changing selected child to:", childId);
      setSelectedChild(childId);
      
      // Réinitialiser l'indicateur après un bref délai
      setTimeout(() => {
        childSelectChanged.current = false;
      }, 100);
    }
  };

  return (
    <div>
      <Label htmlFor="child-select">Sélectionner un enfant</Label>
      <select
        id="child-select"
        value={selectedChild}
        onChange={handleChildSelect}
        className="w-full mt-2 rounded-md border border-gray-300 p-2"
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
