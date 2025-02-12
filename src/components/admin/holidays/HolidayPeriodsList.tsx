
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { HolidayPeriodItem } from "./HolidayPeriodItem";
import { Tables } from "@/integrations/supabase/types";

type HolidayPeriod = Tables<"available_holiday_periods">;

interface HolidayPeriodsListProps {
  holidays: HolidayPeriod[];
  onDelete: () => void;
}

export const HolidayPeriodsList = ({ holidays, onDelete }: HolidayPeriodsListProps) => {
  const { data: reservationCounts } = useQuery({
    queryKey: ["holiday_reservation_counts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};

      const { data: reservations, error } = await supabase
        .from("holiday_reservations")
        .select('period_id');

      if (error) {
        console.error("Error fetching reservations:", error);
        return {};
      }

      reservations?.forEach((reservation) => {
        const periodId = reservation.period_id;
        counts[periodId] = (counts[periodId] || 0) + 1;
      });

      return counts;
    },
  });

  const getReservationCountForPeriod = (periodId: string) => {
    return reservationCounts?.[periodId] || 0;
  };

  const handleDelete = async (holidayId: string) => {
    const { data: reservations, error: countError } = await supabase
      .from("holiday_reservations")
      .select('id', { count: 'exact' })
      .eq('period_id', holidayId);

    if (countError) {
      console.error("Error checking reservations:", countError);
      return;
    }

    if (reservations && reservations.length > 0) {
      alert("Impossible de supprimer cette période car elle a des réservations.");
      return;
    }

    const { error: deleteError } = await supabase
      .from('available_holiday_periods')
      .delete()
      .eq('id', holidayId);

    if (deleteError) {
      console.error("Error deleting holiday period:", deleteError);
      return;
    }

    onDelete();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Périodes de vacances</h2>
      <div className="space-y-4">
        {holidays.map((holiday) => (
          <HolidayPeriodItem
            key={holiday.id}
            holiday={holiday}
            reservationCount={getReservationCountForPeriod(holiday.id)}
            onDelete={() => handleDelete(holiday.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default HolidayPeriodsList;
