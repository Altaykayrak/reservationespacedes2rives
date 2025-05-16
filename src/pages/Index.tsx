import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";

interface AdminProfilesActionsProps {
  profiles: any[];                // ou ProfileData[]
  bulkActionLoading: boolean;
  handleBulkWaitingChange: (value: boolean) => Promise<void>;
  handleBulkClosedChange: (value: boolean) => Promise<void>;
}

export const AdminProfilesActions: React.FC<AdminProfilesActionsProps> = ({
  profiles,
  bulkActionLoading,
  handleBulkWaitingChange,
  handleBulkClosedChange,
}) => {
  const [globalSettingsLoading, setGlobalSettingsLoading] = React.useState(false);
  const { settings, loading, updateGlobalSettings } = useGlobalSettings();

  const handleWednesdayVisibilityChange = async (isVisible: boolean) => {
    setGlobalSettingsLoading(true);
    const success = await updateGlobalSettings({
      hide_wednesday_reservations: !isVisible
    });
    if (success) toast.success("Paramètres globaux mis à jour");
    setGlobalSettingsLoading(false);
  };

  const handleRdvVisibilityChange = async (isVisible: boolean) => {
    setGlobalSettingsLoading(true);
    const success = await updateGlobalSettings({
      hide_rdv_page: !isVisible
    });
    if (success) toast.success("Paramètres globaux mis à jour");
    setGlobalSettingsLoading(false);
  };

  return (
    <div className="space-y-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Paramètres globaux de visibilité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="global-wednesday-visibility" className="flex flex-col space-y-1">
              <span>Page Mercredis</span>
              <span className="text-sm text-muted-foreground">
                Activer/désactiver l'accès pour tous les utilisateurs
              </span>
            </Label>
            <Switch
              id="global-wednesday-visibility"
              checked={!settings.hide_wednesday_reservations}
              onCheckedChange={handleWednesdayVisibilityChange}
              disabled={globalSettingsLoading || loading}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="global-rdv-visibility" className="flex flex-col space-y-1">
              <span>Page RDV</span>
              <span className="text-sm text-muted-foreground">
                Activer/désactiver l'accès pour tous les utilisateurs
              </span>
            </Label>
            <Switch
              id="global-rdv-visibility"
              checked={!settings.hide_rdv_page}
              onCheckedChange={handleRdvVisibilityChange}
              disabled={globalSettingsLoading || loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions de masse</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {/* Vos AlertDialogs pour bulk actions ici */}
          {/* ... */}
        </CardContent>
      </Card>
    </div>
  );
};
