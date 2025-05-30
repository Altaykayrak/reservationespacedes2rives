
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
          
        if (globalError && globalError.code !== "PGRST116") {
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

          if (userError && userError.code !== "PGRST116") {
            console.error("Erreur lors du chargement des paramètres utilisateur:", userError);
            setError(userError);
            toast.error("Erreur lors du chargement des paramètres utilisateur");
          } else if (userSettings) {
            // NOUVELLE LOGIQUE : Les paramètres utilisateur priment sur les paramètres globaux
            // Si l'utilisateur a explicitement défini un paramètre, on l'utilise
            // Sinon, on utilise le paramètre global
            finalSettings = {
              hide_wednesday_reservations: userSettings.hide_wednesday_reservations,
              hide_rdv_page: userSettings.hide_rdv_page
            };
          }
          // Si pas de userSettings trouvé, utiliser uniquement les paramètres globaux
          // (ce qui ne devrait plus arriver grâce au trigger, mais on garde la sécurité)
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
      // S'assurer qu'une entrée user_settings existe pour cet utilisateur
      const { error: upsertError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          hide_wednesday_reservations: newSettings.hide_wednesday_reservations ?? false,
          hide_rdv_page: newSettings.hide_rdv_page ?? false
        });

      if (upsertError) {
        console.error("Error upserting user settings:", upsertError);
        toast.error("Erreur lors de la mise à jour des paramètres utilisateur");
        return false;
      }

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
      // S'assurer qu'une entrée global_settings existe
      const { error } = await supabase
        .from("global_settings")
        .upsert({
          id: "default", // Utiliser un ID fixe pour les paramètres globaux
          hide_wednesday_reservations: newSettings.hide_wednesday_reservations ?? false,
          hide_rdv_page: newSettings.hide_rdv_page ?? false
        });

      if (error) {
        console.error("Error updating global settings:", error);
        toast.error("Erreur lors de la mise à jour des paramètres globaux");
        return false;
      }

      toast.success("Paramètres globaux mis à jour avec succès");
      
      // Recharger les paramètres après mise à jour
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        window.location.reload(); // Recharger pour appliquer les nouveaux paramètres
      }
      
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
