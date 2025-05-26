
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface SpotsBadgeProps {
  availableSpots: number | null;
  isFull: boolean;
  schoolClass?: string;
  isLoading?: boolean;
}

const getSpotsBadgeColor = (spots: number | null, loading: boolean) => {
  if (loading) return "bg-blue-100 text-blue-800";
  if (spots === null || spots === undefined) return "bg-gray-100 text-gray-600";
  if (spots <= 0) return "bg-red-100 text-red-800";
  if (spots <= 5) return "bg-orange-100 text-orange-800";
  return "bg-green-100 text-green-800";
};

const getSpotsBadgeText = (spots: number | null, schoolClass: string = "", loading: boolean = false) => {
  if (loading) {
    return "Calcul des places...";
  }
  
  // Si la valeur est explicitement null ou undefined (pas d'informations)
  if (spots === null || spots === undefined) {
    return "Places non disponibles";
  }
  
  // Si spots est 0 ou négatif, le groupe est complet
  if (spots <= 0) {
    return `Groupe complet - Contactez l'accueil pour être en liste d'attente`;
  }
  
  // Sinon, afficher le nombre de places restantes (qui est > 0)
  return `${spots} place${spots > 1 ? 's' : ''} restante${spots > 1 ? 's' : ''}`;
};

export const SpotsBadge = ({ availableSpots, isFull, schoolClass = "", isLoading = false }: SpotsBadgeProps) => {
  const [displayText, setDisplayText] = useState<string>("");
  const [badgeColor, setBadgeColor] = useState<string>("");
  
  useEffect(() => {
    console.log("SpotsBadge rendering with:", { 
      availableSpots, 
      isFull, 
      schoolClass, 
      isLoading,
      valueType: availableSpots === null ? 'null' : typeof availableSpots 
    });
    
    setDisplayText(getSpotsBadgeText(availableSpots, schoolClass, isLoading));
    setBadgeColor(getSpotsBadgeColor(availableSpots, isLoading));
  }, [availableSpots, isFull, schoolClass, isLoading]);

  return (
    <Badge 
      variant="secondary" 
      className={`${badgeColor} border-none text-[10px] md:text-xs font-medium`}
    >
      {displayText}
    </Badge>
  );
};
