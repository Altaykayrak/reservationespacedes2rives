
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface UserSettingsSectionProps {
  userSettings: {
    hide_wednesday_reservations: boolean;
    hide_rdv_page: boolean;
  };
  onUserSettingChange: (setting: string, value: boolean) => void;
  onResetUserSettings: () => void;
}

export const UserSettingsSection: React.FC<UserSettingsSectionProps> = React.memo(({
  userSettings,
  onUserSettingChange,
  onResetUserSettings
}) => {
  return (
    <>
      <Separator />
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium">
            Paramètres individuels
          </h3>
          <Button variant="outline" size="sm" onClick={onResetUserSettings}>
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
              onCheckedChange={(value) => onUserSettingChange('hide_wednesday_reservations', value)}
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
              onCheckedChange={(value) => onUserSettingChange('hide_rdv_page', value)}
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
  );
});

UserSettingsSection.displayName = "UserSettingsSection";
