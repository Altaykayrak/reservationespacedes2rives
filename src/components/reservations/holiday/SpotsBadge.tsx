
import { Badge } from "@/components/ui/badge";
import { getGroupName } from "@/utils/schoolClassUtils";

interface SpotsBadgeProps {
  spots: number | null;
  schoolClass: string;
  isLoading: boolean;
}

const getSpotsBadgeColor = (spots: number | null) => {
  if (spots === null) return "bg-gray-100 text-gray-600";
  if (spots === 0) return "bg-red-100 text-red-800";
  if (spots <= 5) return "bg-orange-100 text-orange-800";
  return "bg-green-100 text-green-800";
};

const getSpotsBadgeText = (spots: number | null, schoolClass: string) => {
  console.log(`Displaying badge for ${schoolClass} with ${spots} spots`);
  
  if (spots === null) return "Vérification des places impossible";
  
  if (spots === 0) {
    return `Groupe ${getGroupName(schoolClass)} complet, contactez l'accueil si vous souhaitez être en liste d'attente`;
  }
  
  return `${spots} place${spots > 1 ? 's' : ''} restante${spots > 1 ? 's' : ''}`;
};

export const SpotsBadge = ({ spots, schoolClass, isLoading }: SpotsBadgeProps) => {
  if (isLoading || !schoolClass) return null;

  // Debug logging supplémentaire pour diagnostiquer
  console.log(`BADGE RENDERING - Class: ${schoolClass}, Spots: ${spots}, SpotType: ${typeof spots}`);

  return (
    <Badge 
      variant="secondary" 
      className={`${getSpotsBadgeColor(spots)} border-none text-[10px] md:text-xs`}
    >
      {getSpotsBadgeText(spots, schoolClass)}
    </Badge>
  );
};
