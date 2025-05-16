
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { toast } from "sonner";
import type { ProfileData } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";

interface GlobalMenuSettingsProps {
  profile?: ProfileData;
}

export const GlobalMenuSettings: React.FC<GlobalMenuSettingsProps> = ({ profile }) => {
  const { updateGlobalSettings } = useGlobalSettings();
  const [isUpdating, setIsUpdating] = React.useState(false);

  if (!profile) {
    return null;
  }

  const updateUserSetting = async (setting: string, value: boolean) => {
    setIsUpdating(true);
    try {
      // Update the user_settings table for this specific user
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: profile.id,
          [setting]: value
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      toast.success(`Paramètre mis à jour pour ${profile.first_name} ${profile.last_name}`);
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour des paramètres:", error);
      toast.error("Erreur lors de la mise à jour des paramètres");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWednesdayVisibilityChange = async (isVisible: boolean) => {
    await updateUserSetting('hide_wednesday_reservations', !isVisible);
  };

  const handleRdvVisibilityChange = async (isVisible: boolean) => {
    await updateUserSetting('hide_rdv_page', !isVisible);
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
            defaultChecked={true}
            disabled={isUpdating}
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
            defaultChecked={true}
            disabled={isUpdating}
          />
        </div>
      </CardContent>
    </Card>
  );
};
