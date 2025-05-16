// src/hooks/useAdminUserSettings.ts
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

      // 1) Lecture
      const { data, error } = await supabase
        .from("user_settings")
        .select("hide_wednesday_reservations, hide_rdv_page")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("fetch user_settings:", error);
        toast.error("Impossible de charger les paramètres utilisateur");
      }

      if (data) {
        setSettings(data);
      } else {
        // 2) Si pas de ligne existante, on insère la ligne par défaut
        const { error: insertError } = await supabase
          .from("user_settings")
          .insert({
            user_id: userId,
            hide_wednesday_reservations: false,
            hide_rdv_page: false,
          });
        if (insertError) {
          console.error("insert default user_settings:", insertError);
          toast.error("Impossible d'initialiser les paramètres utilisateur");
        }
        // On conserve les valeurs par défaut en front
      }

      setLoading(false);
    })();
  }, [userId]);

  const updateSettings = async (updates: Partial<UserSettingsRecord>) => {
    try {
      // UPSERT + debug
      const { data, error } = await supabase
        .from("user_settings")
        .upsert(
          [{ user_id: userId, ...updates }],
          { onConflict: "user_id", returning: "representation" }
        )
        .select();

      console.log("⟳ user_settings upsert result:", { data, error });

      if (error) throw error;
      if (data && data.length > 0) {
        // on récupère la première ligne retournée
        setSettings(data[0]);
        toast.success("Paramètres utilisateur mis à jour");
        return true;
      } else {
        console.warn("⚠️ upsert n'a retourné aucune ligne", data);
        return false;
      }
    } catch (err: any) {
      console.error("❌ update user_settings error:", err);
      toast.error("Impossible de mettre à jour les paramètres utilisateur");
      return false;
    }
  };

  return { settings, loading, updateSettings };
}
