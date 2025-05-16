
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserSettingsRecord {
  hide_wednesday_reservations: boolean;
  hide_rdv_page: boolean;
}

export function useAdminUserSettings(userId: string) {
  const [settings, setSettings] = useState<UserSettingsRecord>({
    hide_wednesday_reservations: false,
    hide_rdv_page: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_settings")
        .select("hide_wednesday_reservations, hide_rdv_page")
        .eq("user_id", userId)
        .single();
      if (error && error.code !== "PGRST116") {
        console.error("fetch user_settings:", error);
        toast.error("Impossible de charger les paramètres utilisateur");
      }
      if (data) setSettings(data);
      setLoading(false);
    })();
  }, [userId]);

  const updateSettings = async (updates: Partial<UserSettingsRecord>) => {
    try {
      const { error } = await supabase
        .from("user_settings")
        .update(updates)
        .eq("user_id", userId);
      if (error) throw error;
      setSettings(s => ({ ...s, ...updates }));
      toast.success("Paramètres utilisateur mis à jour");
      return true;
    } catch (err: any) {
      console.error("update user_settings:", err);
      toast.error("Impossible de mettre à jour les paramètres utilisateur");
      return false;
    }
  };

  return { settings, loading, updateSettings };
}
