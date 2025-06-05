
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { WednesdaySpots } from "@/hooks/useWednesdaySpots";

export const getSpotsBadgeVariant = (available: number, total: number) => {
  if (total === 0) return "outline";
  const percentage = (available / total) * 100;
  if (percentage === 0) return "destructive";
  if (percentage <= 25) return "secondary";
  if (percentage <= 50) return "outline";
  return "default";
};

export const monthColors = [
  "bg-green-50 border-green-200",
  "bg-purple-50 border-purple-200",
  "bg-orange-50 border-orange-200",
  "bg-pink-50 border-pink-200",
  "bg-yellow-50 border-yellow-200",
  "bg-indigo-50 border-indigo-200",
  "bg-red-50 border-red-200",
  "bg-teal-50 border-teal-200"
];

export const groupWednesdaysByMonth = (wednesdays: WednesdaySpots[]) => {
  return wednesdays.reduce((acc, wednesday) => {
    const date = new Date(wednesday.date);
    const monthKey = format(date, "yyyy-MM", { locale: fr });
    const monthName = format(date, "MMMM yyyy", { locale: fr });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthName,
        wednesdays: []
      };
    }
    acc[monthKey].wednesdays.push(wednesday);
    return acc;
  }, {} as Record<string, { monthName: string; wednesdays: WednesdaySpots[] }>);
};

export const sortMonths = (months: Record<string, { monthName: string; wednesdays: WednesdaySpots[] }>) => {
  return Object.entries(months).sort(([a], [b]) => a.localeCompare(b));
};
