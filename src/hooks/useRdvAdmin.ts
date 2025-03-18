
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Rdv } from "@/types/rdv";

export function useRdvAdmin() {
  const { toast } = useToast();
  const [rdvList, setRdvList] = useState<Rdv[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error("No user found when checking admin status");
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } else {
          console.log("Admin status check result:", data);
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }
    
    checkAdmin();
  }, []);

  // Fetch all rdv
  useEffect(() => {
    async function fetchRdv() {
      if (!isAdmin) {
        console.log("User is not admin, not fetching RDV data");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log("Fetching RDV data for admin user");
        
        // Fetch RDV data without the profiles join
        const { data, error } = await supabase
          .from('rdv')
          .select('*')
          .order('date')
          .order('heure_debut');

        if (error) {
          console.error("Error fetching RDVs:", error);
          throw error;
        }
        
        console.log("RDV data fetched successfully:", data?.length || 0, "records");
        
        // Now fetch user profiles data separately for reserved appointments
        const reservedRdvs = data.filter(rdv => rdv.status === 'réservé' && rdv.user_id);
        
        // Initialize results with base rdv data
        let results = [...data] as Rdv[];
        
        // Only fetch profiles if there are any reserved appointments
        if (reservedRdvs.length > 0) {
          console.log("Fetching profiles for", reservedRdvs.length, "reserved appointments");
          
          // Fetch profiles for reserved appointments
          const userIds = reservedRdvs.map(rdv => rdv.user_id);
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', userIds);
            
          if (profilesError) {
            console.error("Error fetching profiles:", profilesError);
          } else if (profilesData) {
            console.log("Profile data fetched successfully:", profilesData.length, "profiles");
            
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
        console.error("Error fetching RDVs:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les rendez-vous",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchRdv();
  }, [isAdmin, toast]);

  const handleDeleteRdv = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rdv')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le rendez-vous a été supprimé avec succès",
      });

      // Update local state
      setRdvList(rdvList.filter(rdv => rdv.id !== id));
    } catch (error) {
      console.error("Error deleting RDV:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rendez-vous",
        variant: "destructive",
      });
    }
  };

  const handleAddNewRdv = (newRdvs: Rdv[]) => {
    setRdvList([...rdvList, ...newRdvs]);
  };

  return {
    rdvList,
    loading,
    isAdmin,
    handleDeleteRdv,
    handleAddNewRdv
  };
}
