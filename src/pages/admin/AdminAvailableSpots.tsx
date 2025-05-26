
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

  if (loadingWednesdays || loadingHolidays) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Places restantes</h1>
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
    <div className="container mx-auto p-8">
      <div className="flex items-center gap-3 mb-8">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Places restantes</h1>
      </div>

      <Tabs defaultValue="wednesdays" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="wednesdays">
            <Calendar className="mr-2 h-4 w-4" />
            Mercredis ({wednesdaySpots?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="holidays">
            <Clock className="mr-2 h-4 w-4" />
            Vacances ({holidaySpots?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wednesdays">
          <Card>
            <CardHeader>
              <CardTitle>Places disponibles - Mercredis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Maternelle</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Primaire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wednesdaySpots?.map((spot) => {
                      const kindergartenAvailable = spot.max_participants_kindergarten - spot.kindergarten_reserved;
                      const primaryAvailable = spot.max_participants_primary - spot.primary_reserved;
                      
                      return (
                        <tr key={spot.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {format(new Date(spot.date), "EEEE dd MMMM yyyy", { locale: fr })}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge variant={getSpotsBadgeVariant(kindergartenAvailable, spot.max_participants_kindergarten)}>
                              {kindergartenAvailable}/{spot.max_participants_kindergarten}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge variant={getSpotsBadgeVariant(primaryAvailable, spot.max_participants_primary)}>
                              {primaryAvailable}/{spot.max_participants_primary}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holidays">
          <Card>
            <CardHeader>
              <CardTitle>Places disponibles - Vacances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Période</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Maternelle</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Primaire</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Adolescent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holidaySpots?.map((spot, index) => (
                      <tr key={`${spot.period_id}-${spot.reservation_date}`} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {spot.period_name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {format(new Date(spot.reservation_date), "EEEE dd MMMM yyyy", { locale: fr })}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <Badge variant={getSpotsBadgeVariant(spot.kindergarten_spots, spot.kindergarten_capacity)}>
                            {spot.kindergarten_spots}/{spot.kindergarten_capacity}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <Badge variant={getSpotsBadgeVariant(spot.primary_spots, spot.primary_capacity)}>
                            {spot.primary_spots}/{spot.primary_capacity}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <Badge variant={getSpotsBadgeVariant(spot.teen_spots, spot.teen_capacity)}>
                            {spot.teen_spots}/{spot.teen_capacity}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAvailableSpots;
