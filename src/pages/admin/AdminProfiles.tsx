
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
      // First, fetch profiles
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      // Then fetch user emails from auth.users
      const emails = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: userData, error: userError } = await supabase
            .from('user_roles')
            .select('email')
            .eq('user_id', profile.id)
            .single();

          if (userError) {
            console.error('Error fetching user email:', userError);
            return { ...profile, email: '' };
          }

          return {
            ...profile,
            email: userData?.email || ''
          };
        })
      );

      setProfiles(emails);
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
