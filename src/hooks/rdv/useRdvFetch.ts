
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Rdv } from "@/types/rdv";

export const useRdvFetch = (
  userId: string | undefined, 
  setUserRdv: (rdv: Rdv | null) => void,
  setRdvList: (rdvList: Rdv[]) => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  const { toast } = useToast();

  const fetchUserRdv = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      console.log("Fetching user RDV for user:", userId);
      const { data: userRdvData, error: userRdvError } = await supabase
        .from('rdv')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'réservé')
        .order('date')
        .limit(1);
      
      if (userRdvError) throw userRdvError;
      
      console.log("User RDV data:", userRdvData);
      if (userRdvData && userRdvData.length > 0) {
        setUserRdv(userRdvData[0] as unknown as Rdv);
      }
    } catch (error) {
      console.error("Error fetching user RDV:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger votre rendez-vous",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRdvs = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching available RDVs");
      const { data, error } = await supabase
        .from('rdv')
        .select('*')
        .eq('status', 'disponible')
        .order('date')
        .order('heure_debut');

      if (error) throw error;
      
      console.log("Available RDVs:", data);
      if (data) {
        setRdvList(data as unknown as Rdv[]);
        console.log("All available RDVs set:", data.length);
      }
    } catch (error) {
      console.error("Error fetching RDVs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les créneaux disponibles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchUserRdv,
    fetchRdvs
  };
};
