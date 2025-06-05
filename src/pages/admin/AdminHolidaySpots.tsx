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
        // Utiliser la vue optimisée holiday_spots_available qui calcule correctement les places
        const { data: spotsData, error: spotsError } = await supabase
          .from("holiday_spots_available")
          .select("*")
          .order("period_id");

        if (spotsError) {
          console.error("Erreur lors de la récupération des places:", spotsError);
          throw spotsError;
        }

        if (!spotsData || spotsData.length === 0) {
          console.log("Aucune donnée de places disponibles trouvée");
          return [];
        }

        // Récupérer les informations sur les périodes
        const { data: periods, error: periodsError } = await supabase
          .from("available_holiday_periods")
          .select("id, name")
          .order("start_date", { ascending: true });

        if (periodsError) {
          console.error("Erreur lors de la récupération des périodes:", periodsError);
          throw periodsError;
        }

        // Transformer les données pour correspondre à l'interface HolidaySpots
        const transformedData: HolidaySpots[] = spotsData.map(spot => {
          const period = periods?.find(p => p.id === spot.period_id);
          
          return {
            period_id: spot.period_id || '',
            period_name: period?.name || 'Période inconnue',
            reservation_date: spot.reservation_date || '',
            kindergarten_spots: spot.class_group === 'kindergarten' ? (spot.available_spots || 0) : 0,
            primary_spots: spot.class_group === 'primary' ? (spot.available_spots || 0) : 0,
            teen_spots: spot.class_group === 'teen' ? (spot.available_spots || 0) : 0,
            kindergarten_capacity: spot.class_group === 'kindergarten' ? (spot.max_capacity || 0) : 0,
            primary_capacity: spot.class_group === 'primary' ? (spot.max_capacity || 0) : 0,
            teen_capacity: spot.class_group === 'teen' ? (spot.max_capacity || 0) : 0,
          };
        });

        // Regrouper les données par période et date pour obtenir toutes les catégories sur une même ligne
        const groupedByPeriodAndDate = transformedData.reduce((acc, spot) => {
          const key = `${spot.period_id}-${spot.reservation_date}`;
          
          if (!acc[key]) {
            acc[key] = {
              period_id: spot.period_id,
              period_name: spot.period_name,
              reservation_date: spot.reservation_date,
              kindergarten_spots: 0,
              primary_spots: 0,
              teen_spots: 0,
              kindergarten_capacity: 0,
              primary_capacity: 0,
              teen_capacity: 0,
            };
          }

          // Fusionner les données des différentes catégories
          acc[key].kindergarten_spots += spot.kindergarten_spots;
          acc[key].primary_spots += spot.primary_spots;
          acc[key].teen_spots += spot.teen_spots;
          acc[key].kindergarten_capacity += spot.kindergarten_capacity;
          acc[key].primary_capacity += spot.primary_capacity;
          acc[key].teen_capacity += spot.teen_capacity;

          return acc;
        }, {} as Record<string, HolidaySpots>);

        const finalData = Object.values(groupedByPeriodAndDate);
        console.log("Places vacances calculées:", finalData);
        return finalData;
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
