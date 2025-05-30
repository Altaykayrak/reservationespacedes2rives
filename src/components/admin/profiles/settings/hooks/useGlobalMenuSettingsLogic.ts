
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import type { ProfileData } from "@/types/profile";

interface SettingsState {
  hide_wednesday_reservations: boolean;
  hide_rdv_page: boolean;
}

export const useGlobalMenuSettingsLogic = (profile?: ProfileData) => {
  const { updateSettings, updateGlobalSettings } = useGlobalSettings();
  const [userSettings, setUserSettings] = useState<SettingsState>({
    hide_wednesday_reservations: false,
    hide_rdv_page: false
  });
  const [globalSettings, setGlobalSettings] = useState<SettingsState>({
    hide_wednesday_reservations: false,
    hide_rdv_page: false
  });
  const [loading, setLoading] = useState(true);

  const profileId = useMemo(() => profile?.id, [profile?.id]);
  const profileName = useMemo(() => 
    profile ? `${profile.first_name} ${profile.last_name}` : null, 
    [profile?.first_name, profile?.last_name]
  );

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Charger les paramètres globaux
      const { data: global, error: globalError } = await supabase
        .from("global_settings")
        .select("hide_wednesday_reservations, hide_rdv_page")
        .single();
        
      if (global) {
        setGlobalSettings(global);
      }

      // Charger les paramètres utilisateur si un profil est sélectionné
      if (profileId) {
        const { data: user, error: userError } = await supabase
          .from("user_settings")
          .select("hide_wednesday_reservations, hide_rdv_page")
          .eq("user_id", profileId)
          .single();
          
        if (user) {
          setUserSettings(user);
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement des paramètres:", err);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  const handleUserSettingChange = useCallback(async (setting: string, value: boolean) => {
    if (!profileId) return;
    
    const newSettings = { ...userSettings, [setting]: value };
    setUserSettings(newSettings);
    
    const success = await updateSettings(profileId, { [setting]: value });
    if (!success) {
      setUserSettings(userSettings);
    }
  }, [profileId, userSettings, updateSettings]);

  const handleGlobalSettingChange = useCallback(async (setting: string, value: boolean) => {
    const newSettings = { ...globalSettings, [setting]: value };
    setGlobalSettings(newSettings);
    
    const success = await updateGlobalSettings({ [setting]: value });
    if (!success) {
      setGlobalSettings(globalSettings);
    }
  }, [globalSettings, updateGlobalSettings]);

  const resetUserSettings = useCallback(async () => {
    if (!profileId) return;
    
    const success = await updateSettings(profileId, {
      hide_wednesday_reservations: false,
      hide_rdv_page: false
    });
    
    if (success) {
      setUserSettings({
        hide_wednesday_reservations: false,
        hide_rdv_page: false
      });
      toast.success("Paramètres utilisateur réinitialisés");
    }
  }, [profileId, updateSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    userSettings,
    globalSettings,
    loading,
    profileName,
    handleUserSettingChange,
    handleGlobalSettingChange,
    resetUserSettings
  };
};
