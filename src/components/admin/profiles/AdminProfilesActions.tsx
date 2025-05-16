import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";

export const AdminProfilesActions: React.FC = () => {
  const { globalSettings, loading, updateGlobalSettings } = useGlobalSettings();

  const toggleWednesday = async (visible: boolean) => {
    const ok = await updateGlobalSettings({
      hide_wednesday_reservations: !visible,
    });
    if (ok) toast.success("Paramètres globaux mis à jour");
  };
  const toggleRdv = async (visible: boolean) => {
    const ok = await updateGlobalSettings({ hide_rdv_page: !visible });
    if (ok) toast.success("Paramètres globaux mis à jour");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres globaux de visibilité</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Label htmlFor="global-wed">Page Mercredis</Label>
          <Switch
            id="global-wed"
            checked={!globalSettings.hide_wednesday_reservations}
            onCheckedChange={toggleWednesday}
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-between mt-4">
          <Label htmlFor="global-rdv">Page RDV</Label>
          <Switch
            id="global-rdv"
            checked={!globalSettings.hide_rdv_page}
            onCheckedChange={toggleRdv}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
};
