
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users } from "lucide-react";
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

const AdminWednesdaySpots = () => {
  const { data: wednesdaySpots, isLoading } = useQuery({
    queryKey: ["wednesday_spots"],
    queryFn: async () => {
      console.log("Récupération des places disponibles pour les mercredis...");
      
      const { data: wednesdays, error: wednesdaysError } = await supabase
        .from("available_wednesdays")
        .select("*")
        .order("date", { ascending: true });

      if (wednesdaysError) throw wednesdaysError;

      const spotsData: WednesdaySpots[] = [];
      
      for (const wednesday of wednesdays) {
        const { data: kindergartenReservations, error: kError } = await supabase
          .from("wednesday_reservations")
          .select(`
            id,
            children!inner(school_class)
          `)
          .eq("wednesday_id", wednesday.id)
          .eq("status", "confirmed")
          .in("children.school_class", ["PS", "MS", "GS"]);

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

  const getSpotsBadgeVariant = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage === 0) return "destructive";
    if (percentage <= 25) return "secondary";
    if (percentage <= 50) return "outline";
    return "default";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Places restantes - Mercredis</h1>
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
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Places restantes - Mercredis</h1>
        <Badge variant="secondary" className="ml-auto text-xs">
          {wednesdaySpots?.length || 0} mercredis
        </Badge>
      </div>

      <div className="space-y-2">
        {wednesdaySpots?.map((spot) => {
          const kindergartenAvailable = spot.max_participants_kindergarten - spot.kindergarten_reserved;
          const primaryAvailable = spot.max_participants_primary - spot.primary_reserved;
          
          return (
            <Card key={spot.id} className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-blue-800">
                  {format(new Date(spot.date), "EEEE dd MMMM yyyy", { locale: fr })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded border">
                    <h4 className="font-medium text-gray-700 mb-1 text-xs">Maternelle</h4>
                    <Badge variant={getSpotsBadgeVariant(kindergartenAvailable, spot.max_participants_kindergarten)} className="text-xs px-2 py-0.5">
                      {kindergartenAvailable}/{spot.max_participants_kindergarten} places
                    </Badge>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <h4 className="font-medium text-gray-700 mb-1 text-xs">Primaire</h4>
                    <Badge variant={getSpotsBadgeVariant(primaryAvailable, spot.max_participants_primary)} className="text-xs px-2 py-0.5">
                      {primaryAvailable}/{spot.max_participants_primary} places
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminWednesdaySpots;
