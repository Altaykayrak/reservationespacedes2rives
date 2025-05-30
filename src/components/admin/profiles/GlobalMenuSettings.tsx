
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileData } from "@/types/profile";
import { LoadingState } from "./settings/LoadingState";
import { GlobalSettingsSection } from "./settings/GlobalSettingsSection";
import { UserSettingsSection } from "./settings/UserSettingsSection";
import { useGlobalMenuSettingsLogic } from "./settings/hooks/useGlobalMenuSettingsLogic";

interface GlobalMenuSettingsProps {
  profile?: ProfileData;
}

export const GlobalMenuSettings: React.FC<GlobalMenuSettingsProps> = React.memo(({ profile }) => {
  const {
    userSettings,
    globalSettings,
    loading,
    profileName,
    handleUserSettingChange,
    handleGlobalSettingChange,
    resetUserSettings
  } = useGlobalMenuSettingsLogic(profile);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">
          {profileName ? `Paramètres de visibilité pour ${profileName}` : "Paramètres globaux de visibilité"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <GlobalSettingsSection
          globalSettings={globalSettings}
          onGlobalSettingChange={handleGlobalSettingChange}
        />

        {profile && (
          <UserSettingsSection
            userSettings={userSettings}
            onUserSettingChange={handleUserSettingChange}
            onResetUserSettings={resetUserSettings}
          />
        )}
      </CardContent>
    </Card>
  );
});

GlobalMenuSettings.displayName = "GlobalMenuSettings";
