
import { useMemo } from "react";

export const useRdvConfig = () => {
  // Define summer range with explicit Date objects
  const summerRange = useMemo(() => ({
    start: new Date(2025, 6, 1), // July 1, 2025
    end: new Date(2025, 7, 31)   // August 31, 2025
  }), []);

  return {
    summerRange
  };
};
