
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface GlobalSettingsSectionProps {
  globalSettings: {
    hide_wednesday_reservations: boolean;
    hide_rdv_page: boolean;
  };
  onGlobalSettingChange: (setting: string, value: boolean) => void;
}

export const GlobalSettingsSection: React.FC<GlobalSettingsSectionProps> = React.memo(({
  globalSettings,
  onGlobalSettingChange
}) => {
  return (
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
            onCheckedChange={(value) => onGlobalSettingChange('hide_wednesday_reservations', value)}
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
            onCheckedChange={(value) => onGlobalSettingChange('hide_rdv_page', value)}
          />
        </div>
      </div>
    </div>
  );
});

GlobalSettingsSection.displayName = "GlobalSettingsSection";
