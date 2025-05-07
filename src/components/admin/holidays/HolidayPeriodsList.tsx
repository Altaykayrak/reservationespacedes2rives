
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import HolidayPeriodItem from "./HolidayPeriodItem";
import { Tables } from "@/integrations/supabase/types";

type HolidayPeriod = Tables<"available_holiday_periods">;

interface HolidayPeriodsListProps {
  holidays: HolidayPeriod[];
  onDelete: () => void;
}

export const HolidayPeriodsList = ({ holidays, onDelete }: HolidayPeriodsListProps) => {
  const { data: reservationCounts, isLoading } = useQuery({
    queryKey: ["holiday_reservation_counts"],
    queryFn: async () => {
      try {
        console.log("Fetching holiday reservation counts...");
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

        console.log("Fetched reservation counts:", counts);
        return counts;
      } catch (error) {
        console.error("Error in holiday_reservation_counts query:", error);
        return {};
      }
    },
  });

  const getReservationCountForPeriod = (periodId: string) => {
    return reservationCounts?.[periodId] || 0;
  };

  const handleDelete = async (holidayId: string) => {
    try {
      console.log("Checking reservations for holiday period:", holidayId);
      const { data: reservations, error: countError } = await supabase
        .from("holiday_reservations")
        .select('id', { count: 'exact' })
        .eq('period_id', holidayId);

      if (countError) {
        console.error("Error checking reservations:", countError);
        return;
      }

      if (reservations && reservations.length > 0) {
        alert(`Impossible de supprimer cette période car elle a ${reservations.length} réservation(s).`);
        return;
      }

      console.log("Deleting holiday period:", holidayId);
      // D'abord supprimer les classes autorisées liées à cette période
      const { error: allowedClassesError } = await supabase
        .from('holiday_allowed_classes')
        .delete()
        .eq('holiday_period_id', holidayId);

      if (allowedClassesError) {
        console.error("Error deleting holiday allowed classes:", allowedClassesError);
        return;
      }

      // Ensuite supprimer la période de vacances
      const { error: deleteError } = await supabase
        .from('available_holiday_periods')
        .delete()
        .eq('id', holidayId);

      if (deleteError) {
        console.error("Error deleting holiday period:", deleteError);
        return;
      }

      console.log("Holiday period deleted successfully");
      onDelete();
    } catch (error) {
      console.error("Error in handleDelete:", error);
    }
  };

  if (holidays.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Périodes de vacances</h2>
        <p className="text-gray-500">Aucune période de vacances n'est disponible actuellement.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Périodes de vacances</h2>
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {holidays.map((holiday) => (
            <HolidayPeriodItem
              key={holiday.id}
              holiday={holiday}
              reservationCount={getReservationCountForPeriod(holiday.id)}
              onEdit={() => {}} // Implémentation à venir si nécessaire
              onDelete={() => handleDelete(holiday.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HolidayPeriodsList;
