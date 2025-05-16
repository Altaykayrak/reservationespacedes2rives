
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserSettings {
  hide_wednesday_reservations: boolean;
  hide_rdv_page: boolean;
}

export function useUserSettings() {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    hide_wednesday_reservations: false,
    hide_rdv_page: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data, error } = await supabase
          .from("user_settings")
          .select("hide_wednesday_reservations, hide_rdv_page")
          .eq("user_id", session.user.id)
          .single();
        if (error && error.code !== "PGRST116") throw error;
        if (data) setUserSettings(data);
      } catch (err: any) {
        console.error("Erreur loading user_settings:", err);
        toast.error("Impossible de charger les paramètres utilisateur");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const updateUserSettings = async (updates: Partial<UserSettings>) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return false;
      const { error } = await supabase
        .from("user_settings")
        .update(updates)
        .eq("user_id", session.user.id);
      if (error) throw error;
      setUserSettings((us) => ({ ...us, ...updates }));
      return true;
    } catch (err: any) {
      console.error("Erreur update user_settings:", err);
      toast.error("Impossible de mettre à jour les paramètres utilisateur");
      return false;
    }
  };

  return { userSettings, loading, updateUserSettings };
}
