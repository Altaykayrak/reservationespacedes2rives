
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ProfileData } from "@/types/profile";

interface GlobalMenuSettingsProps {
  profile?: ProfileData;
}

export const GlobalMenuSettings: React.FC<GlobalMenuSettingsProps> = React.memo(({ profile }) => {
  const { updateSettings, updateGlobalSettings } = useGlobalSettings();
  const [userSettings, setUserSettings] = useState({
    hide_wednesday_reservations: false,
    hide_rdv_page: false
  });
  const [globalSettings, setGlobalSettings] = useState({
    hide_wednesday_reservations: false,
    hide_rdv_page: false
  });
  const [loading, setLoading] = useState(true);

  // Stabiliser la référence du profile pour éviter les re-renders
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

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleUserSettingChange = useCallback(async (setting: keyof typeof userSettings, value: boolean) => {
    if (!profileId) return;
    
    const newSettings = { ...userSettings, [setting]: value };
    setUserSettings(newSettings);
    
    const success = await updateSettings(profileId, { [setting]: value });
    if (!success) {
      // Revenir à l'état précédent en cas d'erreur
      setUserSettings(userSettings);
    }
  }, [profileId, userSettings, updateSettings]);

  const handleGlobalSettingChange = useCallback(async (setting: keyof typeof globalSettings, value: boolean) => {
    const newSettings = { ...globalSettings, [setting]: value };
    setGlobalSettings(newSettings);
    
    const success = await updateGlobalSettings({ [setting]: value });
    if (!success) {
      // Revenir à l'état précédent en cas d'erreur
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

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">
          {profileName ? `Paramètres de visibilité pour ${profileName}` : "Paramètres globaux de visibilité"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Paramètres globaux - toujours affichés */}
        <div>
          <h3 className="text-base font-medium mb-4">Paramètres globaux (valeurs par défaut)</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="global-wednesday" className="flex flex-col space-y-1">
                <span>Masquer les réservations du mercredi</span>
                <span className="text-sm text-muted-foreground">Valeur par défaut pour tous les utilisateurs</span>
              </Label>
              <Switch 
                id="global-wednesday"
                checked={globalSettings.hide_wednesday_reservations}
                onCheckedChange={(value) => handleGlobalSettingChange('hide_wednesday_reservations', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="global-rdv" className="flex flex-col space-y-1">
                <span>Masquer la page RDV</span>
                <span className="text-sm text-muted-foreground">Valeur par défaut pour tous les utilisateurs</span>
              </Label>
              <Switch 
                id="global-rdv"
                checked={globalSettings.hide_rdv_page}
                onCheckedChange={(value) => handleGlobalSettingChange('hide_rdv_page', value)}
              />
            </div>
          </div>
        </div>

        {profile && (
          <>
            <Separator />
            
            {/* Paramètres utilisateur spécifique */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium">
                  Paramètres individuels
                </h3>
                <Button variant="outline" size="sm" onClick={resetUserSettings}>
                  Réinitialiser
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="user-wednesday" className="flex flex-col space-y-1">
                    <span>Masquer les réservations du mercredi</span>
                    <span className="text-sm text-muted-foreground">Surcharge le paramètre global pour cet utilisateur</span>
                  </Label>
                  <Switch 
                    id="user-wednesday"
                    checked={userSettings.hide_wednesday_reservations}
                    onCheckedChange={(value) => handleUserSettingChange('hide_wednesday_reservations', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="user-rdv" className="flex flex-col space-y-1">
                    <span>Masquer la page RDV</span>
                    <span className="text-sm text-muted-foreground">Surcharge le paramètre global pour cet utilisateur</span>
                  </Label>
                  <Switch 
                    id="user-rdv"
                    checked={userSettings.hide_rdv_page}
                    onCheckedChange={(value) => handleUserSettingChange('hide_rdv_page', value)}
                  />
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                <strong>Nouvelle logique :</strong> Les paramètres individuels priment sur les paramètres globaux. 
                Un utilisateur peut donc accéder à une page même si elle est masquée globalement, 
                si son paramètre individuel l'autorise.
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

GlobalMenuSettings.displayName = "GlobalMenuSettings";
