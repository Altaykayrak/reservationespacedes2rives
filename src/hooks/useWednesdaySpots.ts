
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WednesdaySpots {
  id: string;
  date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
  kindergarten_reserved: number;
  primary_reserved: number;
}

export const useWednesdaySpots = () => {
  return useQuery({
    queryKey: ["wednesday_spots"],
    queryFn: async () => {
      console.log("Récupération des places disponibles pour les mercredis...");
      
      try {
        // Afficher tous les mercredis à venir, même ceux plus ouverts à la réservation
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        const { data: wednesdays, error: wednesdaysError } = await supabase
          .from("available_wednesdays")
          .select("*")
          .gte("date", todayStr)
          .order("date", { ascending: true });

        if (wednesdaysError) {
          console.error("Erreur lors de la récupération des mercredis:", wednesdaysError);
          throw wednesdaysError;
        }

        if (!wednesdays) {
          console.log("Aucun mercredi trouvé");
          return [];
        }

        const spotsData: WednesdaySpots[] = [];
        
        for (const wednesday of wednesdays) {
          console.log("Traitement du mercredi:", wednesday.date);
          
          try {
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

            if (kError) {
              console.error("Erreur kindergarten:", kError);
            }
            if (pError) {
              console.error("Erreur primary:", pError);
            }

            spotsData.push({
              id: wednesday.id,
              date: wednesday.date,
              max_participants_kindergarten: wednesday.max_participants_kindergarten || 0,
              max_participants_primary: wednesday.max_participants_primary || 0,
              kindergarten_reserved: kindergartenReservations?.length || 0,
              primary_reserved: primaryReservations?.length || 0,
            });
          } catch (reservationError) {
            console.error("Erreur lors du traitement des réservations pour", wednesday.date, ":", reservationError);
            spotsData.push({
              id: wednesday.id,
              date: wednesday.date,
              max_participants_kindergarten: wednesday.max_participants_kindergarten || 0,
              max_participants_primary: wednesday.max_participants_primary || 0,
              kindergarten_reserved: 0,
              primary_reserved: 0,
            });
          }
        }

        console.log("Places calculées:", spotsData);
        return spotsData;
      } catch (error) {
        console.error("Erreur générale:", error);
        throw error;
      }
    },
    retry: 1,
  });
};
