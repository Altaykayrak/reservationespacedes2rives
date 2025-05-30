
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileData } from "@/types/profile";

interface GlobalMenuSettingsProps {
  profile?: ProfileData;
}

export const GlobalMenuSettings: React.FC<GlobalMenuSettingsProps> = ({ profile }) => {
  if (!profile) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Paramètres de visibilité des menus</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Aucun paramètre de visibilité disponible pour le moment.
        </div>
      </CardContent>
    </Card>
  );
};
