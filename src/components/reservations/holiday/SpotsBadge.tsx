
import { Badge } from "@/components/ui/badge";
import { getGroupName } from "@/utils/schoolClassUtils";
import { useEffect, useState } from "react";

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

const getSpotsBadgeText = (spots: number | null, schoolClass: string = "", isLoading: boolean = false) => {
  // La fonction getGroupName est utilisée uniquement pour obtenir le nom du groupe
  // et non pour déterminer la disponibilité, qui est faite par useHolidaySpots
  const groupName = schoolClass ? getGroupName(schoolClass) : "";
  
  if (isLoading) {
    return "Chargement des places...";
  }
  
  // Si la valeur est explicitement null ou undefined (pas d'informations)
  if (spots === null || spots === undefined) {
    return "Places non disponibles";
  }
  
  // Si spots est 0, le groupe est complet
  if (spots === 0) {
    return `Groupe complet, contactez l'accueil si vous souhaitez être en liste d'attente`;
  }
  
  // Sinon, afficher le nombre de places restantes (qui est > 0)
  return `${spots} place${spots > 1 ? 's' : ''} restante${spots > 1 ? 's' : ''}`;
};

export const SpotsBadge = ({ availableSpots, isFull, schoolClass = "", isLoading = false }: SpotsBadgeProps) => {
  const [displayText, setDisplayText] = useState<string>("");
  const [badgeColor, setBadgeColor] = useState<string>("");
  
  useEffect(() => {
    console.log("SpotsBadge rendering with:", { availableSpots, isFull, schoolClass, isLoading });
    setDisplayText(getSpotsBadgeText(availableSpots, schoolClass, isLoading));
    setBadgeColor(getSpotsBadgeColor(availableSpots));
  }, [availableSpots, isFull, schoolClass, isLoading]);

  // Toujours afficher le badge, même pendant le chargement ou si pas de classe
  return (
    <Badge 
      variant="secondary" 
      className={`${badgeColor} border-none text-[10px] md:text-xs`}
    >
      {displayText}
    </Badge>
  );
};
