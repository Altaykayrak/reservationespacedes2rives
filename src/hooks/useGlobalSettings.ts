
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GlobalSettings {
  hide_wednesday_reservations: boolean;
  hide_rdv_page: boolean;
}

export const useGlobalSettings = () => {
  const [settings, setSettings] = useState<GlobalSettings>({
    hide_wednesday_reservations: false,
    hide_rdv_page: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // Récupérer d'abord les paramètres globaux
        const { data: globalSettings, error: globalError } = await supabase
          .from("global_settings")
          .select("hide_wednesday_reservations, hide_rdv_page")
          .single();
          
        if (globalError && globalError.code !== "PGRST116") { // PGRST116 est "no rows returned"
          console.error("Erreur lors du chargement des paramètres globaux:", globalError);
          setError(globalError);
          toast.error("Erreur lors du chargement des paramètres globaux");
          setLoading(false);
          return;
        }
        
        let finalSettings: GlobalSettings = {
          hide_wednesday_reservations: globalSettings?.hide_wednesday_reservations || false,
          hide_rdv_page: globalSettings?.hide_rdv_page || false
        };

        // Pour les utilisateurs, récupérer également leurs paramètres personnels
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: userSettings, error: userError } = await supabase
            .from("user_settings")
            .select("hide_wednesday_reservations, hide_rdv_page")
            .eq("user_id", session.user.id)
            .single();

          if (userError && userError.code !== "PGRST116") { // PGRST116 est "no rows returned"
            console.error("Erreur lors du chargement des paramètres utilisateur:", userError);
            setError(userError);
            toast.error("Erreur lors du chargement des paramètres utilisateur");
          } else if (userSettings) {
            // Combiner les paramètres globaux et utilisateur
            // Si l'un des deux est true, le paramètre est activé (la page est masquée)
            finalSettings = {
              hide_wednesday_reservations: globalSettings?.hide_wednesday_reservations || userSettings.hide_wednesday_reservations,
              hide_rdv_page: globalSettings?.hide_rdv_page || userSettings.hide_rdv_page
            };
          }
        }
        
        setSettings(finalSettings);
      } catch (err) {
        console.error("Exception in fetchSettings:", err);
        if (err instanceof Error) {
          setError(err);
          toast.error(`Erreur: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = async (userId: string, newSettings: Partial<GlobalSettings>) => {
    try {
      const { error } = await supabase
        .from("user_settings")
        .update(newSettings)
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating user settings:", error);
        toast.error("Erreur lors de la mise à jour des paramètres utilisateur");
        return false;
      }

      // Update the local state to reflect the changes
      setSettings(prev => ({...prev, ...newSettings}));
      toast.success("Paramètres mis à jour avec succès");
      return true;
    } catch (err) {
      console.error("Exception in updateSettings:", err);
      if (err instanceof Error) {
        toast.error(`Erreur: ${err.message}`);
      }
      return false;
    }
  };

  const updateGlobalSettings = async (newSettings: Partial<GlobalSettings>) => {
    try {
      // Make sure we're updating the global settings record with ID 00000000-0000-0000-0000-000000000000 or equivalent
      const { error } = await supabase
        .from("global_settings")
        .update(newSettings)
        .eq("id", "00000000-0000-0000-0000-000000000000");

      if (error) {
        console.error("Error updating global settings:", error);
        toast.error("Erreur lors de la mise à jour des paramètres globaux");
        return false;
      }

      // Update the local state to reflect the changes
      setSettings(prev => ({...prev, ...newSettings}));
      return true;
    } catch (err) {
      console.error("Exception in updateGlobalSettings:", err);
      if (err instanceof Error) {
        toast.error(`Erreur: ${err.message}`);
      }
      return false;
    }
  };

  return { settings, loading, error, updateSettings, updateGlobalSettings };
};
