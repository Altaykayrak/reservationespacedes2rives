
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Rdv } from "@/types/rdv";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function useRdvAdmin() {
  const { data: isAdmin, isLoading: isAdminLoading } = useAdminAuth();
  const [rdvList, setRdvList] = useState<Rdv[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all rdv
  useEffect(() => {
    async function fetchRdv() {
      // Attendre que la vérification admin soit terminée
      if (isAdminLoading) {
        return;
      }
      
      if (!isAdmin) {
        console.log("[useRdvAdmin] Utilisateur non administrateur, pas de chargement des RDV");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log("[useRdvAdmin] Chargement des RDV pour l'administrateur");
        
        // Fetch RDV data without the profiles join
        const { data, error } = await supabase
          .from('rdv')
          .select('*')
          .order('date')
          .order('heure_debut');

        if (error) {
          console.error("[useRdvAdmin] Erreur lors du chargement des RDV:", error);
          throw error;
        }
        
        console.log("[useRdvAdmin] RDV chargés avec succès:", data?.length || 0, "enregistrements");
        
        // Now fetch user profiles data separately for reserved appointments
        const reservedRdvs = data.filter(rdv => rdv.status === 'réservé' && rdv.user_id);
        
        // Initialize results with base rdv data
        let results = [...data] as Rdv[];
        
        // Only fetch profiles if there are any reserved appointments
        if (reservedRdvs.length > 0) {
          console.log("[useRdvAdmin] Chargement des profils pour", reservedRdvs.length, "rendez-vous réservés");
          
          // Fetch profiles for reserved appointments
          const userIds = reservedRdvs.map(rdv => rdv.user_id);
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', userIds);
            
          if (profilesError) {
            console.error("[useRdvAdmin] Erreur lors du chargement des profils:", profilesError);
          } else if (profilesData) {
            console.log("[useRdvAdmin] Profils chargés avec succès:", profilesData.length, "profils");
            
            // Match profiles to RDVs
            results = data.map(rdv => {
              if (rdv.user_id) {
                const profile = profilesData.find(p => p.id === rdv.user_id);
                if (profile) {
                  return {
                    ...rdv,
                    profiles: {
                      first_name: profile.first_name,
                      last_name: profile.last_name,
                      email: null // We don't have email from profiles query
                    }
                  } as Rdv;
                }
              }
              // Return the RDV with default empty profiles data if no matching profile
              return {
                ...rdv,
                profiles: rdv.user_id ? { first_name: null, last_name: null, email: null } : undefined
              } as Rdv;
            });
          }
        }
        
        setRdvList(results);
      } catch (error) {
        console.error("[useRdvAdmin] Erreur lors du chargement des RDV:", error);
        toast.error("Impossible de charger les rendez-vous");
      } finally {
        setLoading(false);
      }
    }

    fetchRdv();
  }, [isAdmin, isAdminLoading]);

  const handleDeleteRdv = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rdv')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Le rendez-vous a été supprimé avec succès");

      // Update local state
      setRdvList(rdvList.filter(rdv => rdv.id !== id));
    } catch (error) {
      console.error("[useRdvAdmin] Erreur lors de la suppression du RDV:", error);
      toast.error("Impossible de supprimer le rendez-vous");
    }
  };

  const handleAddNewRdv = (newRdvs: Rdv[]) => {
    setRdvList([...rdvList, ...newRdvs]);
  };

  return {
    rdvList,
    loading: loading || isAdminLoading,
    isAdmin: !!isAdmin,
    handleDeleteRdv,
    handleAddNewRdv
  };
}
