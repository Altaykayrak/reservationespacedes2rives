
import { Badge } from "@/components/ui/badge";
import { useHolidaySpots } from "@/hooks/useHolidaySpots";
import { Skeleton } from "@/components/ui/skeleton";

interface HolidaySpotsBadgeProps {
  periodId: string;
  date: Date;
  childSchoolClass: string;
}

const HolidaySpotsBadge = ({ periodId, date, childSchoolClass }: HolidaySpotsBadgeProps) => {
  const { availableSpots, isFull, isLoading, error } = useHolidaySpots(
    periodId, 
    date, 
    childSchoolClass
  );

  if (error) {
    console.error("Error fetching holiday spots:", error);
    return null;
  }

  if (isLoading) {
    return <Skeleton className="h-5 w-24" />;
  }

  const getBadgeColor = () => {
    if (availableSpots === null) return "bg-gray-100 text-gray-600";
    if (isFull) return "bg-red-100 text-red-800";
    if (availableSpots <= 5) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  const getBadgeText = () => {
    if (availableSpots === null) {
      return "Places non disponibles";
    }
    
    if (isFull) {
      return "Groupe complet";
    }
    
    return `${availableSpots} place${availableSpots > 1 ? 's' : ''} restante${availableSpots > 1 ? 's' : ''}`;
  };

  return (
    <Badge 
      variant="secondary" 
      className={`${getBadgeColor()} border-none text-[10px] md:text-xs`}
    >
      {getBadgeText()}
    </Badge>
  );
};

export default HolidaySpotsBadge;
