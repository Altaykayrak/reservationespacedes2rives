
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface HolidaySpotsBadgeProps {
  periodId: string;
  date: string;              // format "YYYY-MM-DD"
  childSchoolClass: string;  // ex. "GS", "CP"…
}

export default function HolidaySpotsBadge({
  periodId,
  date,
  childSchoolClass
}: HolidaySpotsBadgeProps) {
  const [spots, setSpots] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchSpots() {
      const { data, error } = await supabase.rpc(
        "check_holiday_spots_available",
        {
          p_period_id: periodId,
          p_reservation_date: date,
          p_child_school_class: childSchoolClass,
        }
      );
      if (!mounted) return;
      if (error) setError(error.message);
      else setSpots(data as number);
    }

    if (periodId && date && childSchoolClass) {
      fetchSpots();
    }

    return () => {
      mounted = false;
    };
  }, [periodId, date, childSchoolClass]);

  if (error) {
    return <span className="text-red-600 text-xs">ERR</span>;
  }
  if (spots === null) {
    return <span className="text-gray-500 text-xs">…</span>;
  }
  return (
    <span
      className={`text-xs font-medium ${
        spots > 0 ? "text-green-600" : "text-red-600"
      }`}
    >
      {spots > 0 ? `${spots} place${spots > 1 ? 's' : ''} restante${spots > 1 ? 's' : ''}` : "Complet"}
    </span>
  );
}
