
import { Button } from "@/components/ui/button";
import { FileText, Users, Eye, EyeOff, Calendar } from "lucide-react";
import { ProfileData } from "@/types/profile";
import { exportProfilesToPDF } from "./export/profilesPdfExport";

interface AdminProfilesActionsProps {
  profiles: ProfileData[];
  bulkActionLoading: boolean;
  handleBulkWaitingChange: (isWaiting: boolean) => void;
  handleBulkClosedChange: (isClosed: boolean) => void;
  handleBulkRdvAccessChange: (hideAccess: boolean) => void;
  handleBulkWednesdayAccessChange: (hideAccess: boolean) => void;
}

export const AdminProfilesActions: React.FC<AdminProfilesActionsProps> = ({
  profiles,
  bulkActionLoading,
  handleBulkWaitingChange,
  handleBulkClosedChange,
  handleBulkRdvAccessChange,
  handleBulkWednesdayAccessChange,
}) => {
  const handleExportPDF = () => {
    exportProfilesToPDF(profiles);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        onClick={handleExportPDF}
        variant="outline"
        size="sm"
        disabled={profiles.length === 0}
      >
        <FileText className="mr-2 h-4 w-4" />
        Exporter PDF ({profiles.length})
      </Button>
      
      <Button
        onClick={() => handleBulkWaitingChange(true)}
        variant="outline"
        size="sm"
        disabled={bulkActionLoading || profiles.length === 0}
      >
        <Users className="mr-2 h-4 w-4" />
        Mettre tous en attente
      </Button>
      
      <Button
        onClick={() => handleBulkWaitingChange(false)}
        variant="outline"
        size="sm"
        disabled={bulkActionLoading || profiles.length === 0}
      >
        <Users className="mr-2 h-4 w-4" />
        Enlever tous de l'attente
      </Button>
      
      <Button
        onClick={() => handleBulkClosedChange(true)}
        variant="outline"
        size="sm"
        disabled={bulkActionLoading || profiles.length === 0}
      >
        <Users className="mr-2 h-4 w-4" />
        Fermer tous les comptes
      </Button>
      
      <Button
        onClick={() => handleBulkClosedChange(false)}
        variant="outline"
        size="sm"
        disabled={bulkActionLoading || profiles.length === 0}
      >
        <Users className="mr-2 h-4 w-4" />
        Ouvrir tous les comptes
      </Button>
      
      <Button
        onClick={() => handleBulkRdvAccessChange(true)}
        variant="outline"
        size="sm"
        disabled={bulkActionLoading || profiles.length === 0}
      >
        <EyeOff className="mr-2 h-4 w-4" />
        Masquer accès RDV
      </Button>
      
      <Button
        onClick={() => handleBulkRdvAccessChange(false)}
        variant="outline"
        size="sm"
        disabled={bulkActionLoading || profiles.length === 0}
      >
        <Eye className="mr-2 h-4 w-4" />
        Afficher accès RDV
      </Button>
      
      <Button
        onClick={() => handleBulkWednesdayAccessChange(true)}
        variant="outline"
        size="sm"
        disabled={bulkActionLoading || profiles.length === 0}
      >
        <EyeOff className="mr-2 h-4 w-4" />
        Masquer accès Mercredis
      </Button>
      
      <Button
        onClick={() => handleBulkWednesdayAccessChange(false)}
        variant="outline"
        size="sm"
        disabled={bulkActionLoading || profiles.length === 0}
      >
        <Eye className="mr-2 h-4 w-4" />
        Afficher accès Mercredis
      </Button>
    </div>
  );
};
