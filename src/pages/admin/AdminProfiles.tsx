
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileData } from "@/types/profile";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Loader2 } from "lucide-react";

const AdminProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError(null);

      try {
        // Récupérer les profils avec les email associés
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            automatic_payment,
            accepted_cgu,
            created_at,
            updated_at
          `);

        if (profileError) throw profileError;

        // Récupérer les emails des utilisateurs depuis user_roles
        const { data: userRoles, error: userRolesError } = await supabase
          .from('user_roles')
          .select('user_id, email');

        if (userRolesError) throw userRolesError;

        // Combiner les données
        const mergedProfiles: ProfileData[] = profileData.map(profile => {
          const userRole = userRoles.find(role => role.user_id === profile.id);
          return {
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: userRole?.email || '',
            automatic_payment: profile.automatic_payment,
            accepted_cgu: profile.accepted_cgu,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          };
        });

        setProfiles(mergedProfiles);
      } catch (err: any) {
        console.error('Error fetching profiles:', err);
        setError(err.message || 'Une erreur est survenue lors de la récupération des profils.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Chargement des données...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Prélèvement automatique</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      profiles.map((profile) => (
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
                          <TableCell>
                            {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfiles;
