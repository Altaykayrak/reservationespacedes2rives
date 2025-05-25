
import { Badge } from "@/components/ui/badge";
import { useHolidaySpots } from "@/hooks/useHolidaySpots";

interface HolidaySpotsBadgeProps {
  periodId: string;
  date: string;
  childSchoolClass: string;
}

export const HolidaySpotsBadge = ({ 
  periodId, 
  date, 
  childSchoolClass 
}: HolidaySpotsBadgeProps) => {
  const dateObj = new Date(date);
  const { availableSpots, isFull, isLoading } = useHolidaySpots(
    periodId, 
    dateObj, 
    childSchoolClass
  );

  const getSpotsBadgeColor = (spots: number | null) => {
    if (spots === null || spots === undefined) return "bg-gray-100 text-gray-600";
    if (spots <= 0) return "bg-red-100 text-red-800";
    if (spots <= 5) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  const getSpotsBadgeText = (spots: number | null, isLoading: boolean = false) => {
    if (isLoading) {
      return "Calcul...";
    }
    
    if (spots === null || spots === undefined) {
      return "Non disponible";
    }
    
    if (spots <= 0) {
      return "Complet";
    }
    
    return `${spots} place${spots > 1 ? 's' : ''} libre${spots > 1 ? 's' : ''}`;
  };

  const badgeColor = getSpotsBadgeColor(availableSpots);
  const badgeText = getSpotsBadgeText(availableSpots, isLoading);

  // Log pour débugger l'affichage
  console.log("🎨 HolidaySpotsBadge - Affichage:", {
    periodId,
    date,
    childSchoolClass,
    availableSpots,
    badgeText,
    isLoading
  });

  return (
    <Badge 
      variant="secondary" 
      className={`${badgeColor} border-none text-[10px] md:text-xs`}
    >
      {badgeText}
    </Badge>
  );
};
