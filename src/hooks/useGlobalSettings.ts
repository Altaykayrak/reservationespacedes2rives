
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
        // For users, fetch their own settings
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from("user_settings")
            .select("hide_wednesday_reservations, hide_rdv_page")
            .eq("user_id", session.user.id)
            .single();

          if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned"
            console.error("Error fetching user settings:", error);
            setError(error);
            toast.error("Erreur lors du chargement des paramètres utilisateur");
          } else if (data) {
            setSettings(data);
          }
        }
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

  return { settings, loading, error, updateSettings };
};
