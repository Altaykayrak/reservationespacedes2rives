
import { useMemo } from "react";
import { Rdv } from "@/types/rdv";

export const useRdvConfig = (rdvList: Rdv[] = []) => {
  // Derive the available range from the actual list of slots so the calendar
  // adapts automatically to any year/period without hardcoding.
  const summerRange = useMemo(() => {
    const parsed = rdvList
      .map((s) => {
        const [y, m, d] = s.date.split("-").map(Number);
        return new Date(y, (m || 1) - 1, d || 1);
      })
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (parsed.length > 0) {
      const first = parsed[0];
      const last = parsed[parsed.length - 1];
      return {
        start: new Date(first.getFullYear(), first.getMonth(), 1),
        end: new Date(last.getFullYear(), last.getMonth() + 1, 0),
      };
    }

    // Sensible fallback covering the current year's summer registration window.
    const year = new Date().getFullYear();
    return {
      start: new Date(year, 5, 1),
      end: new Date(year, 7, 31),
    };
  }, [rdvList]);

  return {
    summerRange,
  };
};
