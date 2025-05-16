// src/components/admin/profiles/GlobalMenuSettings.tsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAdminUserSettings } from "@/hooks/useAdminUserSettings";
import type { ProfileData } from "@/types/profile";

interface GlobalMenuSettingsProps {
  profile: ProfileData;
}

export function GlobalMenuSettings({ profile }: GlobalMenuSettingsProps) {
  const { settings, loading, updateSettings } = useAdminUserSettings(profile.id);

  const onToggleWed = (visible: boolean) => {
    updateSettings({ hide_wednesday_reservations: !visible });
  };
  const onToggleRdv = (visible: boolean) => {
    updateSettings({ hide_rdv_page: !visible });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Visibilité pour {profile.last_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Label htmlFor="user-wed">Page Mercredis</Label>
          <Switch
            id="user-wed"
            checked={!settings.hide_wednesday_reservations}
            onCheckedChange={onToggleWed}
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-between mt-4">
          <Label htmlFor="user-rdv">Page RDV</Label>
          <Switch
            id="user-rdv"
            checked={!settings.hide_rdv_page}
            onCheckedChange={onToggleRdv}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
