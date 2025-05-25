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
  const [spots, setSpots] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpots = async () => {
      // Validation simple
      if (!periodId || !date || !childSchoolClass) {
        setError("Paramètre manquant");
        return;
      }

      const { data, error } = await supabase.rpc("check_holiday_spots_available", {
        p_period_id: periodId,
        p_reservation_date: date,
        p_child_school_class: childSchoolClass,
      });

      if (error) {
        console.error("❌ HolidaySpotsBadge - Erreur SQL:", error);
        setError("Erreur de récupération des places");
      } else {
        console.log("✅ Places restantes:", data);
        setSpots(data);
        setError(null);
      }
    };

    fetchSpots();
  }, [periodId, date, childSchoolClass]);

  if (error) return <span style={{ color: "red" }}>{error}</span>;
  if (spots === null) return <span>Chargement...</span>;

  return <span>Places restantes : {spots}</span>;
};
