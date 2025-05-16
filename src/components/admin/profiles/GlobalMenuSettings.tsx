
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ProfileData } from "@/types/profile";
import { useAdminUserSettings } from "@/hooks/useAdminUserSettings";

interface GlobalMenuSettingsProps {
  profile?: ProfileData;
}

export const GlobalMenuSettings: React.FC<GlobalMenuSettingsProps> = ({ profile }) => {
  const { settings, loading, updateSettings } = useAdminUserSettings(profile?.id || '');

  if (!profile) {
    return null;
  }

  const handleWednesdayVisibilityChange = async (isVisible: boolean) => {
    await updateSettings({ hide_wednesday_reservations: !isVisible });
  };

  const handleRdvVisibilityChange = async (isVisible: boolean) => {
    await updateSettings({ hide_rdv_page: !isVisible });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Paramètres de visibilité des menus</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="wednesday-visibility" className="flex flex-col space-y-1">
            <span>Page Mercredis</span>
            <span className="text-sm text-muted-foreground">Permet l'accès aux réservations des mercredis</span>
          </Label>
          <Switch 
            id="wednesday-visibility" 
            onCheckedChange={handleWednesdayVisibilityChange} 
            checked={!settings.hide_wednesday_reservations}
            disabled={loading}
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <Label htmlFor="rdv-visibility" className="flex flex-col space-y-1">
            <span>Page RDV</span>
            <span className="text-sm text-muted-foreground">Permet l'accès à la page d'inscription</span>
          </Label>
          <Switch 
            id="rdv-visibility" 
            onCheckedChange={handleRdvVisibilityChange} 
            checked={!settings.hide_rdv_page}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
};
