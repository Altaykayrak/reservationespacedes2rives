
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

  // Listen for period selection from URL search parameters
  useEffect(() => {
    // Only update if URL params actually changed to prevent loops
    const searchParams = new URLSearchParams(location.search);
    const periodId = searchParams.get("periodId");
    
    if (periodId && periodId !== selectedPeriodId) {
      setSelectedPeriodId(periodId);
      previousPeriodId.current = periodId;
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

  console.log("Children passed to ChildSelector:", children);
  console.log("Filtered children based on page type:", filteredChildren);
  console.log("Current path:", location.pathname);
  console.log("isHolidayReservation:", isHolidayReservation);
  console.log("Selected period ID:", selectedPeriodId);
  console.log("Period info:", periodInfo);
  console.log("Class mappings:", classMappings);
  console.log("Is summer period:", isSummerPeriod);

  // Handle child selection with anti-bounce protection
  const handleChildSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const childId = e.target.value;
    if (childId !== selectedChild) {
      setSelectedChild(childId);
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
