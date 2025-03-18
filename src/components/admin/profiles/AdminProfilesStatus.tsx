
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface AdminProfilesStatusProps {
  loading: boolean;
  error: string | null;
}

export const AdminProfilesStatus: React.FC<AdminProfilesStatusProps> = ({
  loading,
  error,
}) => {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return null;
};
