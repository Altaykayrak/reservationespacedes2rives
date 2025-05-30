
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { toast } from "sonner";
import type { ProfileData } from "@/types/profile";

interface GlobalMenuSettingsProps {
  profile?: ProfileData;
}

export const GlobalMenuSettings: React.FC<GlobalMenuSettingsProps> = ({ profile }) => {
  const { updateSettings } = useGlobalSettings();

  if (!profile) {
    return null;
  }

  const handleRdvVisibilityChange = async (isVisible: boolean) => {
    const success = await updateSettings(profile.id, {
      hide_rdv_page: !isVisible
    });
    if (success) {
      toast.success(`Page RDV ${isVisible ? 'affichée' : 'masquée'} pour ${profile.first_name} ${profile.last_name}`);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Paramètres de visibilité des menus</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="rdv-visibility" className="flex flex-col space-y-1">
            <span>Page RDV</span>
            <span className="text-sm text-muted-foreground">Permet l'accès à la page d'inscription</span>
          </Label>
          <Switch 
            id="rdv-visibility" 
            onCheckedChange={handleRdvVisibilityChange} 
            defaultChecked={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};
