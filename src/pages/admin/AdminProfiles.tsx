
import { useEffect, useState } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileData } from "@/types/profile";

interface ProfileWithUserRole {
  id: string;
  first_name: string | null;
  last_name: string | null;
  automatic_payment: boolean;
  accepted_cgu: boolean;
  created_at: string;
  updated_at: string;
  user_roles: {
    email: string;
  }[];
}

const AdminProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      // Modifié pour utiliser une jointure explicite avec user_roles via l'id
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!user_roles_user_id_fkey(
            email
          )
        `);

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      if (profilesData) {
        const formattedProfiles: ProfileData[] = (profilesData as unknown as ProfileWithUserRole[]).map(profile => ({
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.user_roles?.[0]?.email || '',
          automatic_payment: profile.automatic_payment,
          accepted_cgu: profile.accepted_cgu,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }));
        setProfiles(formattedProfiles);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Gestion des utilisateurs</h1>
        
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Prélèvement automatique</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>{profile.last_name || '-'}</TableCell>
                  <TableCell>{profile.first_name || '-'}</TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={profile.automatic_payment} 
                      disabled
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminProfiles;
