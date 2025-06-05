
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palmtree, Users, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { exportHolidaySpotsToPdf } from "@/components/admin/spots/export/holidaySpotsPdfExport";

interface HolidaySpots {
  period_id: string;
  period_name: string;
  reservation_date: string;
  kindergarten_spots: number;
  primary_spots: number;
  teen_spots: number;
  kindergarten_capacity: number;
  primary_capacity: number;
  teen_capacity: number;
}

const AdminHolidaySpots = () => {
  const { data: holidaySpots, isLoading, error } = useQuery({
    queryKey: ["holiday_spots"],
    queryFn: async () => {
      console.log("Récupération des places disponibles pour les vacances...");
      
      try {
        const { data: periods, error: periodsError } = await supabase
          .from("available_holiday_periods")
          .select("*")
          .order("start_date", { ascending: true });

        if (periodsError) {
          console.error("Erreur lors de la récupération des périodes:", periodsError);
          throw periodsError;
        }

        if (!periods) {
          console.log("Aucune période trouvée");
          return [];
        }

        const spotsData: HolidaySpots[] = [];

        for (const period of periods) {
          console.log("Traitement de la période:", period.name);
          
          try {
            const startDate = new Date(period.start_date);
            const endDate = new Date(period.end_date);
            const dates: Date[] = [];
            
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
              const dayOfWeek = d.getDay();
              if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                dates.push(new Date(d));
              }
            }

            for (const date of dates) {
              const dateStr = format(date, "yyyy-MM-dd");
              
              try {
                // Utiliser une requête plus simple pour compter les réservations
                const { data: kindergartenReservations } = await supabase
                  .from("holiday_reservations")
                  .select(`
                    id,
                    children!inner(school_class)
                  `)
                  .eq("period_id", period.id)
                  .eq("reservation_date", dateStr)
                  .eq("status", "confirmed")
                  .in("children.school_class", ["PS", "MS", "GS"]);

                const { data: primaryReservations } = await supabase
                  .from("holiday_reservations")
                  .select(`
                    id,
                    children!inner(school_class)
                  `)
                  .eq("period_id", period.id)
                  .eq("reservation_date", dateStr)
                  .eq("status", "confirmed")
                  .in("children.school_class", ["CP", "CE1", "CE2", "CM1", "CM2"]);

                const { data: teenReservations } = await supabase
                  .from("holiday_reservations")
                  .select(`
                    id,
                    children!inner(school_class)
                  `)
                  .eq("period_id", period.id)
                  .eq("reservation_date", dateStr)
                  .eq("status", "confirmed")
                  .in("children.school_class", ["6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale"]);

                const kindergartenCount = kindergartenReservations?.length || 0;
                const primaryCount = primaryReservations?.length || 0;
                const teenCount = teenReservations?.length || 0;

                const kindergartenAvailable = Math.max(0, period.max_participants_kindergarten - kindergartenCount);
                const primaryAvailable = Math.max(0, period.max_participants_primary - primaryCount);
                const teenAvailable = Math.max(0, period.max_participants_teen - teenCount);

                spotsData.push({
                  period_id: period.id,
                  period_name: period.name,
                  reservation_date: dateStr,
                  kindergarten_spots: kindergartenAvailable,
                  primary_spots: primaryAvailable,
                  teen_spots: teenAvailable,
                  kindergarten_capacity: period.max_participants_kindergarten,
                  primary_capacity: period.max_participants_primary,
                  teen_capacity: period.max_participants_teen,
                });
              } catch (dateError) {
                console.error(`Erreur pour la date ${dateStr}:`, dateError);
                // Continuer avec des valeurs par défaut
                spotsData.push({
                  period_id: period.id,
                  period_name: period.name,
                  reservation_date: dateStr,
                  kindergarten_spots: period.max_participants_kindergarten,
                  primary_spots: period.max_participants_primary,
                  teen_spots: period.max_participants_teen,
                  kindergarten_capacity: period.max_participants_kindergarten,
                  primary_capacity: period.max_participants_primary,
                  teen_capacity: period.max_participants_teen,
                });
              }
            }
          } catch (periodError) {
            console.error(`Erreur lors du traitement de la période ${period.name}:`, periodError);
          }
        }

        console.log("Places vacances calculées:", spotsData);
        return spotsData;
      } catch (error) {
        console.error("Erreur générale:", error);
        throw error;
      }
    },
    retry: 1,
  });

  const getSpotsBadgeVariant = (available: number, total: number) => {
    if (total === 0) return "outline";
    const percentage = (available / total) * 100;
    if (percentage === 0) return "destructive";
    if (percentage <= 25) return "secondary";
    if (percentage <= 50) return "outline";
    return "default";
  };

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

  const groupedHolidaySpots = holidaySpots?.reduce((acc, spot) => {
    if (!acc[spot.period_id]) {
      acc[spot.period_id] = {
        period_name: spot.period_name,
        dates: []
      };
    }
    acc[spot.period_id].dates.push(spot);
    return acc;
  }, {} as Record<string, { period_name: string; dates: HolidaySpots[] }>);

  const handlePdfExport = () => {
    if (groupedHolidaySpots) {
      exportHolidaySpotsToPdf(groupedHolidaySpots);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Places restantes - Vacances</h1>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des places disponibles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Places restantes - Vacances</h1>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erreur lors du chargement des données</p>
            <p className="text-sm text-gray-600">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Palmtree className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Places restantes - Vacances</h1>
          <Badge variant="secondary" className="ml-auto text-xs">
            {Object.keys(groupedHolidaySpots || {}).length} périodes
          </Badge>
        </div>
        <Button
          variant="outline"
          onClick={handlePdfExport}
          className="flex items-center gap-2"
          disabled={!groupedHolidaySpots || Object.keys(groupedHolidaySpots).length === 0}
        >
          <FileText className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div className="space-y-3">
        {groupedHolidaySpots && Object.keys(groupedHolidaySpots).length > 0 ? (
          Object.entries(groupedHolidaySpots).map(([periodId, periodData], index) => (
            <Card key={periodId} className={`${periodColors[index % periodColors.length]} border`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-gray-800">
                  {periodData.period_name}
                </CardTitle>
                <p className="text-xs text-gray-600">{periodData.dates.length} jours disponibles</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {periodData.dates.map((spot) => (
                    <div key={`${spot.period_id}-${spot.reservation_date}`} className="bg-white p-2 rounded border shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="font-medium text-gray-800 text-xs">
                          {format(new Date(spot.reservation_date), "EEEE dd MMMM yyyy", { locale: fr })}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                          <div className="text-center">
                            <div className="text-xs text-gray-600 mb-0.5">Maternelle</div>
                            <Badge variant={getSpotsBadgeVariant(spot.kindergarten_spots, spot.kindergarten_capacity)} className="text-xs px-1 py-0.5">
                              {spot.kindergarten_spots}/{spot.kindergarten_capacity}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-600 mb-0.5">Primaire</div>
                            <Badge variant={getSpotsBadgeVariant(spot.primary_spots, spot.primary_capacity)} className="text-xs px-1 py-0.5">
                              {spot.primary_spots}/{spot.primary_capacity}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-600 mb-0.5">Adolescent</div>
                            <Badge variant={getSpotsBadgeVariant(spot.teen_spots, spot.teen_capacity)} className="text-xs px-1 py-0.5">
                              {spot.teen_spots}/{spot.teen_capacity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Aucune période de vacances disponible</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHolidaySpots;
