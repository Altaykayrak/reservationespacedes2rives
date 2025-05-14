
import { Badge } from "@/components/ui/badge";
import { getGroupName } from "@/utils/schoolClassUtils";
import { memo, useMemo } from "react";

interface SpotsBadgeProps {
  availableSpots: number | null;
  isFull: boolean;
  schoolClass?: string;
  isLoading?: boolean;
}

// Utiliser memo pour éviter les re-rendus inutiles
export const SpotsBadge = memo(({ availableSpots, isFull, schoolClass = "", isLoading = false }: SpotsBadgeProps) => {
  // Calculer le texte et la couleur en utilisant useMemo pour éviter les recalculs inutiles
  const { badgeText, badgeColor } = useMemo(() => {
    const groupName = schoolClass ? getGroupName(schoolClass) : "";
    
    let text;
    if (isLoading) {
      text = "Vérification des places...";
    } else if (availableSpots === null || availableSpots === undefined) {
      text = "Vérifiez dans un instant";
    } else if (availableSpots === 0) {
      text = `Groupe ${groupName} complet`;
    } else {
      text = `${availableSpots} place${availableSpots > 1 ? 's' : ''} restante${availableSpots > 1 ? 's' : ''}`;
    }
    
    let color;
    if (availableSpots === null || availableSpots === undefined) {
      color = "bg-gray-100 text-gray-600";
    } else if (availableSpots === 0) {
      color = "bg-red-100 text-red-800";
    } else if (availableSpots <= 5) {
      color = "bg-orange-100 text-orange-800";
    } else {
      color = "bg-green-100 text-green-800";
    }

    return { badgeText: text, badgeColor: color };
  }, [availableSpots, isFull, schoolClass, isLoading]);

  return (
    <Badge 
      variant="secondary" 
      className={`${badgeColor} border-none text-[10px] md:text-xs`}
    >
      {badgeText}
    </Badge>
  );
});

// Ajouter un displayName pour les devtools React
SpotsBadge.displayName = "SpotsBadge";
