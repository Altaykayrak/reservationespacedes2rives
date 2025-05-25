
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface HolidaySpotsBadgeProps {
  periodId: string; // UUID
  date: string; // Format YYYY-MM-DD
  childSchoolClass: string; // Exemple: "CP", "GS", "CM2"
}

export const HolidaySpotsBadge = ({
  periodId,
  date,
  childSchoolClass,
}: HolidaySpotsBadgeProps) => {
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpotsRemaining = async () => {
      // Validation simple
      if (!periodId || !date || !childSchoolClass) {
        console.error("❌ HolidaySpotsBadge - Paramètres manquants:", { periodId, date, childSchoolClass });
        setError("Paramètres manquants");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      console.log("🔄 HolidaySpotsBadge - Appel check_holiday_spots_available avec:", {
        p_period_id: periodId,
        p_reservation_date: date,
        p_child_school_class: childSchoolClass,
      });

      try {
        const { data, error } = await supabase.rpc("check_holiday_spots_available", {
          p_period_id: periodId,
          p_reservation_date: date,
          p_child_school_class: childSchoolClass,
        });

        if (error) {
          console.error("❌ HolidaySpotsBadge - Erreur SQL:", error);
          setError("Erreur de récupération des places");
          setSpotsRemaining(null);
        } else {
          console.log(`✅ HolidaySpotsBadge - Places RESTANTES pour ${date}:`, data);
          // La fonction SQL retourne déjà les places restantes (capacité - réservations)
          setSpotsRemaining(data);
          setError(null);
        }
      } catch (err) {
        console.error("❌ HolidaySpotsBadge - Exception:", err);
        setError("Erreur inattendue");
        setSpotsRemaining(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpotsRemaining();
  }, [periodId, date, childSchoolClass]);

  if (error) {
    return (
      <span className="text-red-500 text-xs px-2 py-1 bg-red-100 rounded">
        {error}
      </span>
    );
  }
  
  if (isLoading) {
    return (
      <span className="text-gray-500 text-xs px-2 py-1 bg-gray-100 rounded animate-pulse">
        Chargement...
      </span>
    );
  }

  // Affichage des places restantes
  const getDisplayText = () => {
    if (spotsRemaining === null || spotsRemaining === undefined) {
      return "Places non disponibles";
    }
    if (spotsRemaining <= 0) {
      return "Complet";
    }
    return `${spotsRemaining} place${spotsRemaining > 1 ? 's' : ''} restante${spotsRemaining > 1 ? 's' : ''}`;
  };

  const getBackgroundColor = () => {
    if (spotsRemaining === null || spotsRemaining === undefined) {
      return "bg-gray-100 text-gray-600";
    }
    if (spotsRemaining <= 0) {
      return "bg-red-100 text-red-800";
    }
    if (spotsRemaining <= 5) {
      return "bg-orange-100 text-orange-800";
    }
    return "bg-green-100 text-green-800";
  };

  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${getBackgroundColor()}`}>
      {getDisplayText()}
    </span>
  );
};
