import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GlobalSettings {
  id: string;
  hide_wednesday_reservations: boolean;
  hide_rdv_page: boolean;
}

export function useGlobalSettings() {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    id: "",
    hide_wednesday_reservations: false,
    hide_rdv_page: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("global_settings")
          .select("id, hide_wednesday_reservations, hide_rdv_page")
          .single();
        if (error && error.code !== "PGRST116") throw error;
        if (data) setGlobalSettings(data);
      } catch (err: any) {
        console.error("Erreur loading global_settings:", err);
        toast.error("Impossible de charger les paramètres globaux");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateGlobalSettings = async (
    updates: Partial<Omit<GlobalSettings, "id">>
  ) => {
    if (!globalSettings.id) return false;
    try {
      const { error } = await supabase
        .from("global_settings")
        .update(updates)
        .eq("id", globalSettings.id);
      if (error) throw error;
      setGlobalSettings((gs) => ({ ...gs, ...updates }));
      return true;
    } catch (err: any) {
      console.error("Erreur update global_settings:", err);
      toast.error("Impossible de mettre à jour les paramètres globaux");
      return false;
    }
  };

  return { globalSettings, loading, updateGlobalSettings };
}
