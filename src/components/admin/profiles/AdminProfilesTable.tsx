
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { ProfileData } from "@/types/profile";

interface AdminProfilesTableProps {
  profiles: ProfileData[];
  handleAutomaticPaymentChange: (id: string, current: boolean) => void;
  handleWaitingChange: (id: string, current: boolean) => void;
  handleClosedChange: (id: string, current: boolean) => void;
  handleRdvAccessChange: (id: string, current: boolean) => void;
  handleWednesdayAccessChange: (id: string, current: boolean) => void;
}

export const AdminProfilesTable: React.FC<AdminProfilesTableProps> = ({
  profiles,
  handleAutomaticPaymentChange,
  handleWaitingChange,
  handleClosedChange,
  handleRdvAccessChange,
  handleWednesdayAccessChange,
}) => {
  return (
    <div className="mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Prénom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Paiement automatique</TableHead>
            <TableHead>En attente</TableHead>
            <TableHead>Fermé</TableHead>
            <TableHead>Accès RDV masqué</TableHead>
            <TableHead>Accès Mercredis masqué</TableHead>
            <TableHead>CGU acceptées</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="font-medium">{profile.last_name}</TableCell>
              <TableCell>{profile.first_name}</TableCell>
              <TableCell>{profile.email}</TableCell>
              <TableCell>
                <Switch
                  checked={profile.automatic_payment}
                  onCheckedChange={() => handleAutomaticPaymentChange(profile.id, profile.automatic_payment)}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={profile.is_waiting || false}
                  onCheckedChange={() => handleWaitingChange(profile.id, profile.is_waiting || false)}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={profile.is_closed || false}
                  onCheckedChange={() => handleClosedChange(profile.id, profile.is_closed || false)}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={profile.hide_rdv_access || false}
                  onCheckedChange={() => handleRdvAccessChange(profile.id, profile.hide_rdv_access || false)}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={profile.hide_wednesday_access || false}
                  onCheckedChange={() => handleWednesdayAccessChange(profile.id, profile.hide_wednesday_access || false)}
                />
              </TableCell>
              <TableCell>
                <Badge variant={profile.accepted_cgu ? "default" : "destructive"}>
                  {profile.accepted_cgu ? "Oui" : "Non"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
