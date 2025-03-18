
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { exportProfilesToPDF } from "@/components/admin/profiles/export/profilesPdfExport";
import type { ProfileData } from "@/types/profile";

interface AdminProfilesActionsProps {
  profiles: ProfileData[];
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
  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button onClick={() => exportProfilesToPDF(profiles)}>
        <FileDown className="mr-2 h-4 w-4" />
        Exporter en PDF
      </Button>
      
      <div className="space-x-2">
        <Button 
          onClick={() => handleBulkWaitingChange(true)} 
          variant="outline" 
          disabled={bulkActionLoading}
        >
          {bulkActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Tous en attente
        </Button>
        <Button 
          onClick={() => handleBulkWaitingChange(false)} 
          variant="outline"
          disabled={bulkActionLoading}
        >
          {bulkActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Aucun en attente
        </Button>
      </div>
      
      <div className="space-x-2">
        <Button 
          onClick={() => handleBulkClosedChange(true)} 
          variant="outline"
          disabled={bulkActionLoading}
        >
          {bulkActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Tous fermés
        </Button>
        <Button 
          onClick={() => handleBulkClosedChange(false)} 
          variant="outline"
          disabled={bulkActionLoading}
        >
          {bulkActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Aucun fermé
        </Button>
      </div>
    </div>
  );
};
