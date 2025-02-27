
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileData } from "@/types/profile";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const AdminProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modifiedProfiles, setModifiedProfiles] = useState<Map<string, ProfileData>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles_with_emails')
        .select('*');

      if (fetchError) throw fetchError;

      if (data) {
        const formattedProfiles: ProfileData[] = data.map(profile => ({
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email || 'Email inconnu',
          automatic_payment: profile.automatic_payment,
          accepted_cgu: profile.accepted_cgu,
          is_waiting: profile.is_waiting || false,
          is_closed: profile.is_closed || false,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }));

        setProfiles(formattedProfiles);
      }
    } catch (err: any) {
      console.error('Error fetching profiles:', err);
      setError(err.message || 'Une erreur est survenue lors de la récupération des profils.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (profileId: string, field: 'is_waiting' | 'is_closed', value: boolean) => {
    const profileToUpdate = profiles.find(p => p.id === profileId);
    if (!profileToUpdate) return;

    // Créer une copie du profil avec les changements
    const updatedProfile = { ...profileToUpdate };
    
    // Si on active une case, on désactive l'autre
    if (field === 'is_waiting') {
      updatedProfile.is_waiting = value;
      if (value) updatedProfile.is_closed = false;
    } else {
      updatedProfile.is_closed = value;
      if (value) updatedProfile.is_waiting = false;
    }

    // Mettre à jour l'état local des profils
    setProfiles(prevProfiles => 
      prevProfiles.map(profile => 
        profile.id === profileId ? updatedProfile : profile
      )
    );

    // Ajouter aux profils modifiés
    setModifiedProfiles(new Map(modifiedProfiles.set(profileId, updatedProfile)));
  };

  const saveAllChanges = async () => {
    if (modifiedProfiles.size === 0) {
      toast.info('Aucune modification à enregistrer');
      return;
    }

    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const [profileId, profile] of modifiedProfiles.entries()) {
        console.log(`Tentative de sauvegarde du profil ${profileId}:`, {
          is_waiting: profile.is_waiting,
          is_closed: profile.is_closed
        });
        
        const { error } = await supabase
          .from('profiles')
          .update({
            is_waiting: profile.is_waiting,
            is_closed: profile.is_closed
          })
          .eq('id', profileId);
        
        if (error) {
          console.error(`Erreur lors de la mise à jour du profil ${profileId}:`, error);
          errorCount++;
        } else {
          console.log(`Profil ${profileId} mis à jour avec succès`);
          successCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} modifications enregistrées avec succès`);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} modifications ont échoué`);
      }
      
      // Vider les modifications après la sauvegarde
      setModifiedProfiles(new Map());
      
      // Rafraîchir les données
      await fetchProfiles();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      toast.error(`Erreur: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <div className="flex gap-2">
            <Button onClick={fetchProfiles} variant="outline" disabled={loading || isSaving}>
              <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Rafraîchir
            </Button>
            <Button 
              onClick={saveAllChanges} 
              disabled={modifiedProfiles.size === 0 || loading || isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Sauvegarde en cours...' : 'Enregistrer les modifications'}
              {modifiedProfiles.size > 0 && !isSaving && (
                <span className="ml-1 bg-primary-foreground text-primary px-2 py-0.5 rounded-full text-xs">
                  {modifiedProfiles.size}
                </span>
              )}
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Liste des utilisateurs</CardTitle>
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
                      <TableHead>En attente</TableHead>
                      <TableHead>Fermé</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
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
                            <Checkbox
                              checked={profile.is_waiting}
                              disabled={isSaving}
                              onCheckedChange={(checked) => {
                                handleCheckboxChange(profile.id, 'is_waiting', checked === true);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={profile.is_closed}
                              disabled={isSaving}
                              onCheckedChange={(checked) => {
                                handleCheckboxChange(profile.id, 'is_closed', checked === true);
                              }}
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
