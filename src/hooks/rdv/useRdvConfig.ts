
import { useMemo } from "react";

export const useRdvConfig = () => {
  // Define summer range with explicit Date objects
  // Fixons les dates pour inclure juin (mois 5) dans la plage, puisque les rdvList contiennent des dates de juin
  const summerRange = useMemo(() => ({
    start: new Date(2025, 5, 1),  // 1er juin 2025 (mois 5 en JS)
    end: new Date(2025, 7, 31)    // 31 août 2025
  }), []);

  return {
    summerRange
  };
};
