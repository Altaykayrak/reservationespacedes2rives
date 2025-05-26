
import { Badge } from "@/components/ui/badge";
import { useHolidaySpots } from "@/hooks/useHolidaySpots";
import { useEffect, useState } from "react";

interface SpotsBadgeProps {
  availableSpots: number | null;
  isFull: boolean;
  schoolClass?: string;
  isLoading?: boolean;
  periodId?: string;
  date?: Date;
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
  
  if (spots === null || spots === undefined) {
    return "Places non disponibles";
  }
  
  if (spots <= 0) {
    return `Groupe complet - Contactez l'accueil pour être en liste d'attente`;
  }
  
  return `${spots} place${spots > 1 ? 's' : ''} restante${spots > 1 ? 's' : ''}`;
};

export const SpotsBadge = ({ 
  availableSpots: propAvailableSpots, 
  isFull: propIsFull, 
  schoolClass = "", 
  isLoading: propIsLoading = false,
  periodId,
  date
}: SpotsBadgeProps) => {
  const [displayText, setDisplayText] = useState<string>("");
  const [badgeColor, setBadgeColor] = useState<string>("");
  
  // Si periodId et date sont fournis, utiliser le hook pour obtenir les données actualisées
  const { availableSpots: hookAvailableSpots, isLoading: hookIsLoading } = useHolidaySpots(
    periodId || "", 
    date || new Date(), 
    schoolClass
  );
  
  // Utiliser les données du hook si disponibles, sinon utiliser les props
  const availableSpots = periodId && date ? hookAvailableSpots : propAvailableSpots;
  const isLoading = periodId && date ? hookIsLoading : propIsLoading;
  
  useEffect(() => {
    console.log("SpotsBadge rendering with:", { 
      availableSpots, 
      isFull: propIsFull, 
      schoolClass, 
      isLoading,
      periodId,
      date: date?.toISOString().split('T')[0],
      valueType: availableSpots === null ? 'null' : typeof availableSpots 
    });
    
    setDisplayText(getSpotsBadgeText(availableSpots, schoolClass, isLoading));
    setBadgeColor(getSpotsBadgeColor(availableSpots, isLoading));
  }, [availableSpots, propIsFull, schoolClass, isLoading, periodId, date]);

  return (
    <Badge 
      variant="secondary" 
      className={`${badgeColor} border-none text-[10px] md:text-xs font-medium`}
    >
      {displayText}
    </Badge>
  );
};
