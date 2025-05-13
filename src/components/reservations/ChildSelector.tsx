
import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";
import { useLocation } from "react-router-dom";
import { useState, useEffect, memo, useCallback } from "react";
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

export const ChildSelector = memo(({
  selectedChild,
  setSelectedChild,
  children,
  setSelectedDates,
  onCM2SummerPeriodCheck
}: ChildSelectorProps) => {
  const location = useLocation();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [summerPeriods] = useState<string[]>(["ETE-01", "ETE-02", "ETE-03", "ETE-04"]);

  // Listen for period selection from URL search parameters
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const periodId = searchParams.get("periodId");
      if (periodId) {
        setSelectedPeriodId(periodId);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des paramètres d'URL:", error);
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
    isAdminTeenHolidayReservation
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

  // Gestionnaire d'événements optimisé pour éviter les rechargements de page
  const handleChildChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const form = e.target.closest('form');
    if (form) {
      // Empêcher tout formulaire parent de se soumettre
      form.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        formEvent.stopPropagation();
      }, { once: true });
    }
    
    const childId = e.target.value;
    console.log("Sélection d'enfant:", childId);
    
    if (childId !== selectedChild) {
      setSelectedChild(childId);
    }
  }, [selectedChild, setSelectedChild]);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Label htmlFor="child-select">Sélectionner un enfant</Label>
      <select
        id="child-select"
        value={selectedChild || ""}
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
});

ChildSelector.displayName = "ChildSelector";
