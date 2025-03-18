
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import type { ProfileData } from "@/types/profile";

interface AdminProfilesTableProps {
  profiles: ProfileData[];
  handleAutomaticPaymentChange: (id: string, automatic_payment: boolean) => Promise<void>;
  handleWaitingChange: (id: string, is_waiting: boolean) => Promise<void>;
  handleClosedChange: (id: string, is_closed: boolean) => Promise<void>;
}

export const AdminProfilesTable: React.FC<AdminProfilesTableProps> = ({
  profiles,
  handleAutomaticPaymentChange,
  handleWaitingChange,
  handleClosedChange,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Prénom</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Prélèvement automatique</TableHead>
          <TableHead>En attente</TableHead>
          <TableHead>Fermé</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell>{profile.last_name}</TableCell>
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
                checked={profile.is_waiting}
                onCheckedChange={() => handleWaitingChange(profile.id, profile.is_waiting)}
              />
            </TableCell>
            <TableCell>
              <Switch
                checked={profile.is_closed}
                onCheckedChange={() => handleClosedChange(profile.id, profile.is_closed)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
