
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface WednesdaySpots {
  id: string;
  date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
  kindergarten_reserved: number;
  primary_reserved: number;
}

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

const AdminAvailableSpots = () => {
  // Récupérer les places disponibles pour les mercredis
  const { data: wednesdaySpots, isLoading: loadingWednesdays } = useQuery({
    queryKey: ["wednesday_spots"],
    queryFn: async () => {
      console.log("Récupération des places disponibles pour les mercredis...");
      
      // Récupérer tous les mercredis disponibles
      const { data: wednesdays, error: wednesdaysError } = await supabase
        .from("available_wednesdays")
        .select("*")
        .order("date", { ascending: true });

      if (wednesdaysError) throw wednesdaysError;

      // Pour chaque mercredi, calculer les places restantes
      const spotsData: WednesdaySpots[] = [];
      
      for (const wednesday of wednesdays) {
        // Compter les réservations maternelle
        const { data: kindergartenReservations, error: kError } = await supabase
          .from("wednesday_reservations")
          .select(`
            id,
            children!inner(school_class)
          `)
          .eq("wednesday_id", wednesday.id)
          .eq("status", "confirmed")
          .in("children.school_class", ["PS", "MS", "GS"]);

        // Compter les réservations primaire  
        const { data: primaryReservations, error: pError } = await supabase
          .from("wednesday_reservations")
          .select(`
            id,
            children!inner(school_class)
          `)
          .eq("wednesday_id", wednesday.id)
          .eq("status", "confirmed")
          .in("children.school_class", ["CP", "CE1", "CE2", "CM1", "CM2"]);

        if (kError || pError) {
          console.error("Erreur lors du comptage des réservations:", kError || pError);
          continue;
        }

        spotsData.push({
          id: wednesday.id,
          date: wednesday.date,
          max_participants_kindergarten: wednesday.max_participants_kindergarten,
          max_participants_primary: wednesday.max_participants_primary,
          kindergarten_reserved: kindergartenReservations?.length || 0,
          primary_reserved: primaryReservations?.length || 0,
        });
      }

      return spotsData;
    },
  });

  // Récupérer les places disponibles pour les vacances
  const { data: holidaySpots, isLoading: loadingHolidays } = useQuery({
    queryKey: ["holiday_spots"],
    queryFn: async () => {
      console.log("Récupération des places disponibles pour les vacances...");
      
      // Récupérer toutes les périodes de vacances
      const { data: periods, error: periodsError } = await supabase
        .from("available_holiday_periods")
        .select("*")
        .order("start_date", { ascending: true });

      if (periodsError) throw periodsError;

      const spotsData: HolidaySpots[] = [];

      for (const period of periods) {
        // Générer toutes les dates de la période (jours ouvrables uniquement)
        const startDate = new Date(period.start_date);
        const endDate = new Date(period.end_date);
        const dates: Date[] = [];
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay();
          if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Lundi à vendredi
            dates.push(new Date(d));
          }
        }

        // Pour chaque date, calculer les places restantes par groupe
        for (const date of dates) {
          const dateStr = format(date, "yyyy-MM-dd");
          
          try {
            // Utiliser la fonction RPC pour calculer les places restantes
            const { data: kindergartenSpots } = await supabase.rpc(
              'check_holiday_spots_available',
              {
                p_period_id: period.id,
                p_reservation_date: dateStr,
                p_child_school_class: 'MS' // Représentatif de la maternelle
              }
            );

            const { data: primarySpots } = await supabase.rpc(
              'check_holiday_spots_available',
              {
                p_period_id: period.id,
                p_reservation_date: dateStr,
                p_child_school_class: 'CP' // Représentatif du primaire
              }
            );

            const { data: teenSpots } = await supabase.rpc(
              'check_holiday_spots_available',
              {
                p_period_id: period.id,
                p_reservation_date: dateStr,
                p_child_school_class: '6ème' // Représentatif des ados
              }
            );

            spotsData.push({
              period_id: period.id,
              period_name: period.name,
              reservation_date: dateStr,
              kindergarten_spots: kindergartenSpots || 0,
              primary_spots: primarySpots || 0,
              teen_spots: teenSpots || 0,
              kindergarten_capacity: period.max_participants_kindergarten,
              primary_capacity: period.max_participants_primary,
              teen_capacity: period.max_participants_teen,
            });
          } catch (error) {
            console.error(`Erreur pour la date ${dateStr}:`, error);
          }
        }
      }

      return spotsData;
    },
  });

  const getSpotsBadgeVariant = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage === 0) return "destructive";
    if (percentage <= 25) return "secondary";
    if (percentage <= 50) return "outline";
    return "default";
  };

  // Couleurs pour les blocs de périodes
  const periodColors = [
    "bg-blue-50 border-blue-200",
    "bg-green-50 border-green-200", 
    "bg-purple-50 border-purple-200",
    "bg-orange-50 border-orange-200",
    "bg-pink-50 border-pink-200",
    "bg-yellow-50 border-yellow-200",
    "bg-indigo-50 border-indigo-200",
    "bg-red-50 border-red-200"
  ];

  // Grouper les données de vacances par période
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

  if (loadingWednesdays || loadingHolidays) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Places restantes</h1>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des places disponibles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Places restantes</h1>
      </div>

      <Tabs defaultValue="wednesdays" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="wednesdays">
            <Calendar className="mr-2 h-4 w-4" />
            Mercredis ({wednesdaySpots?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="holidays">
            <Clock className="mr-2 h-4 w-4" />
            Vacances ({Object.keys(groupedHolidaySpots || {}).length} périodes)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wednesdays">
          <div className="space-y-4">
            {wednesdaySpots?.map((spot) => {
              const kindergartenAvailable = spot.max_participants_kindergarten - spot.kindergarten_reserved;
              const primaryAvailable = spot.max_participants_primary - spot.primary_reserved;
              
              return (
                <Card key={spot.id} className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-800">
                      {format(new Date(spot.date), "EEEE dd MMMM yyyy", { locale: fr })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg border">
                        <h4 className="font-semibold text-gray-700 mb-2 text-sm">Maternelle</h4>
                        <Badge variant={getSpotsBadgeVariant(kindergartenAvailable, spot.max_participants_kindergarten)} className="text-sm px-2 py-1">
                          {kindergartenAvailable}/{spot.max_participants_kindergarten} places
                        </Badge>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <h4 className="font-semibold text-gray-700 mb-2 text-sm">Primaire</h4>
                        <Badge variant={getSpotsBadgeVariant(primaryAvailable, spot.max_participants_primary)} className="text-sm px-2 py-1">
                          {primaryAvailable}/{spot.max_participants_primary} places
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="holidays">
          <div className="space-y-6">
            {Object.entries(groupedHolidaySpots || {}).map(([periodId, periodData], index) => (
              <Card key={periodId} className={`${periodColors[index % periodColors.length]} border-2`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-800">
                    {periodData.period_name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{periodData.dates.length} jours disponibles</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {periodData.dates.map((spot) => (
                      <div key={`${spot.period_id}-${spot.reservation_date}`} className="bg-white p-3 rounded-lg border shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="font-medium text-gray-800 text-sm">
                            {format(new Date(spot.reservation_date), "EEEE dd MMMM yyyy", { locale: fr })}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="text-center">
                              <div className="text-xs text-gray-600 mb-1">Maternelle</div>
                              <Badge variant={getSpotsBadgeVariant(spot.kindergarten_spots, spot.kindergarten_capacity)} className="text-xs">
                                {spot.kindergarten_spots}/{spot.kindergarten_capacity}
                              </Badge>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-600 mb-1">Primaire</div>
                              <Badge variant={getSpotsBadgeVariant(spot.primary_spots, spot.primary_capacity)} className="text-xs">
                                {spot.primary_spots}/{spot.primary_capacity}
                              </Badge>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-600 mb-1">Adolescent</div>
                              <Badge variant={getSpotsBadgeVariant(spot.teen_spots, spot.teen_capacity)} className="text-xs">
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
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAvailableSpots;
