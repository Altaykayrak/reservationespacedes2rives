
import { useEffect, useState } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileData } from "@/types/profile";

const AdminProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          automatic_payment,
          updated_at,
          auth.users!profiles_id_fkey (
            email
          )
        `);

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      if (profilesData) {
        const formattedProfiles = profilesData.map(profile => ({
          ...profile,
          email: profile.users?.email || '',
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
