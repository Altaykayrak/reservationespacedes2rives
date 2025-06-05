
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

const periodColors = [
  "bg-green-50 border-green-200",
  "bg-purple-50 border-purple-200",
  "bg-orange-50 border-orange-200",
  "bg-pink-50 border-pink-200",
  "bg-yellow-50 border-yellow-200",
  "bg-indigo-50 border-indigo-200",
  "bg-red-50 border-red-200",
  "bg-teal-50 border-teal-200"
];

// Fonction pour trier les périodes chronologiquement
const sortPeriods = (holidays: HolidayPeriod[]) => {
  return [...holidays].sort((a, b) => {
    // Extraire les numéros des périodes ETE-XX
    const aMatch = a.name?.match(/^ETE-(\d+)$/);
    const bMatch = b.name?.match(/^ETE-(\d+)$/);
    
    // Si les deux sont des périodes ETE, trier par numéro
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }
    
    // Si seulement a est une période ETE, la mettre en premier
    if (aMatch) return -1;
    
    // Si seulement b est une période ETE, la mettre en premier
    if (bMatch) return 1;
    
    // Pour les autres périodes, tri par date de début
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  });
};

export const HolidayPeriodsList = ({ holidays, onDelete }: HolidayPeriodsListProps) => {
  const { data: reservationCounts, isLoading, refetch } = useQuery({
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

      // Supprimer les mappings de classes spécifiques
      const { error: mappingsError } = await supabase
        .from('holiday_period_class_mappings')
        .delete()
        .eq('holiday_period_id', holidayId);

      if (mappingsError) {
        console.error("Error deleting holiday class mappings:", mappingsError);
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

  // Rafraîchir les données après une modification de mapping
  const handleMappingChange = () => {
    refetch();
  };

  if (holidays.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Périodes de vacances</h2>
        <p className="text-gray-500">Aucune période de vacances n'est disponible actuellement.</p>
      </div>
    );
  }

  const sortedHolidays = sortPeriods(holidays);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Périodes de vacances</h2>
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedHolidays.map((holiday, index) => (
            <div key={holiday.id} className={`${periodColors[index % periodColors.length]} border rounded-lg`}>
              <HolidayPeriodItem
                holiday={holiday}
                reservationCount={getReservationCountForPeriod(holiday.id)}
                onEdit={() => {}} // Implémentation à venir si nécessaire
                onDelete={() => handleDelete(holiday.id)}
                onMappingChange={handleMappingChange}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HolidayPeriodsList;
