
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Calendar, CalendarX } from "lucide-react";
import type { ProfileData } from "@/types/profile";

interface AdminProfilesActionsProps {
  profiles: ProfileData[];
  bulkActionLoading: boolean;
  handleBulkWaitingChange: (value: boolean) => void;
  handleBulkClosedChange: (value: boolean) => void;
  handleBulkRdvAccessChange: (value: boolean) => void;
  handleBulkWednesdayAccessChange: (value: boolean) => void;
}

export const AdminProfilesActions: React.FC<AdminProfilesActionsProps> = ({
  profiles,
  bulkActionLoading,
  handleBulkWaitingChange,
  handleBulkClosedChange,
  handleBulkRdvAccessChange,
  handleBulkWednesdayAccessChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Actions en masse ({profiles.length} profils)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">État d'attente</h4>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkWaitingChange(true)}
                disabled={bulkActionLoading}
                className="w-full"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Tous en attente
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkWaitingChange(false)}
                disabled={bulkActionLoading}
                className="w-full"
              >
                <UserX className="h-4 w-4 mr-2" />
                Tous actifs
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">État fermé</h4>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkClosedChange(true)}
                disabled={bulkActionLoading}
                className="w-full"
              >
                <UserX className="h-4 w-4 mr-2" />
                Tous fermés
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkClosedChange(false)}
                disabled={bulkActionLoading}
                className="w-full"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Tous ouverts
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Accès RDV</h4>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkRdvAccessChange(true)}
                disabled={bulkActionLoading}
                className="w-full"
              >
                <CalendarX className="h-4 w-4 mr-2" />
                Masquer RDV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkRdvAccessChange(false)}
                disabled={bulkActionLoading}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Afficher RDV
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Accès Mercredis</h4>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkWednesdayAccessChange(true)}
                disabled={bulkActionLoading}
                className="w-full"
              >
                <CalendarX className="h-4 w-4 mr-2" />
                Masquer Mercredis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkWednesdayAccessChange(false)}
                disabled={bulkActionLoading}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Afficher Mercredis
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
