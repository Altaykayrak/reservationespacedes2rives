
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GlobalSettings {
  hide_wednesday_reservations: boolean;
  hide_rdv_page: boolean;
}

export const useGlobalSettings = () => {
  const [settings, setSettings] = useState<GlobalSettings>({
    hide_wednesday_reservations: false,
    hide_rdv_page: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("global_settings")
          .select("*")
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "no rows returned" error, which is expected on first run
          console.error("Error loading global settings:", error);
        }

        if (data) {
          setSettings({
            hide_wednesday_reservations: data.hide_wednesday_reservations || false,
            hide_rdv_page: data.hide_rdv_page || false,
          });
        }
      } catch (error) {
        console.error("Exception loading global settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { settings, loading };
};
