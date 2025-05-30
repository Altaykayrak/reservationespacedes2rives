
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const LoadingState: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="text-center text-muted-foreground">Chargement...</div>
      </CardContent>
    </Card>
  );
};
