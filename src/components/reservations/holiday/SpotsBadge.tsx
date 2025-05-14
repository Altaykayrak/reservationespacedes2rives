
import { Badge } from "@/components/ui/badge";
import { getGroupName } from "@/utils/schoolClassUtils";

interface SpotsBadgeProps {
  availableSpots: number | null;
  isFull: boolean;
  schoolClass?: string;
  isLoading?: boolean;
}

const getSpotsBadgeColor = (spots: number | null) => {
  if (spots === null || spots === undefined) return "bg-gray-100 text-gray-600";
  if (spots === 0) return "bg-red-100 text-red-800";
  if (spots <= 5) return "bg-orange-100 text-orange-800";
  return "bg-green-100 text-green-800";
};

const getSpotsBadgeText = (spots: number | null, schoolClass: string = "") => {
  // La fonction getGroupName est utilisée uniquement pour obtenir le nom du groupe
  // et non pour déterminer la disponibilité, qui est faite par useHolidaySpots
  const groupName = schoolClass ? getGroupName(schoolClass) : "";
  
  if (spots === null || spots === undefined) {
    return "Vérification des places en cours...";
  }
  
  if (spots === 0) {
    return `Groupe complet, contactez l'accueil si vous souhaitez être en liste d'attente`;
  }
  
  return `${spots} place${spots > 1 ? 's' : ''} restante${spots > 1 ? 's' : ''}`;
};

export const SpotsBadge = ({ availableSpots, isFull, schoolClass = "", isLoading = false }: SpotsBadgeProps) => {
  if (isLoading || (!schoolClass && availableSpots === null)) return null;

  return (
    <Badge 
      variant="secondary" 
      className={`${getSpotsBadgeColor(availableSpots)} border-none text-[10px] md:text-xs`}
    >
      {getSpotsBadgeText(availableSpots, schoolClass)}
    </Badge>
  );
};
