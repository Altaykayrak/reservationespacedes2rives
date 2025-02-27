
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileData } from "@/types/profile";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const AdminProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

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

  const handleCheckboxChange = async (profileId: string, field: 'is_waiting' | 'is_closed', value: boolean) => {
    try {
      // Empêcher les clics multiples sur le même profil
      if (processingIds.has(profileId)) return;
      
      // Ajouter l'ID à la liste des profils en cours de traitement
      setProcessingIds(prev => new Set(prev).add(profileId));

      // Mettre à jour localement en premier pour une UI réactive
      setProfiles(prevProfiles => 
        prevProfiles.map(profile => {
          if (profile.id !== profileId) return profile;
          
          const updatedProfile = { ...profile };
          
          if (field === 'is_waiting') {
            updatedProfile.is_waiting = value;
            if (value) updatedProfile.is_closed = false;
          } else {
            updatedProfile.is_closed = value;
            if (value) updatedProfile.is_waiting = false;
          }
          
          return updatedProfile;
        })
      );

      // Préparation des données pour la mise à jour
      const updates: Record<string, boolean> = {};
      
      // Si on active une case, on désactive l'autre
      if (field === 'is_waiting') {
        updates.is_waiting = value;
        if (value) updates.is_closed = false;
      } else {
        updates.is_closed = value;
        if (value) updates.is_waiting = false;
      }

      console.log(`Mise à jour directe pour le profil ${profileId}:`, updates);

      // Envoyer la mise à jour à Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId)
        .select();
      
      if (error) {
        console.error("Erreur lors de la mise à jour:", error);
        toast.error(`Erreur lors de la mise à jour: ${error.message}`);
        
        // En cas d'erreur, restaurer l'état précédent
        await fetchProfiles();
      } else {
        console.log("Mise à jour réussie:", data);
        toast.success('Statut mis à jour avec succès');
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      toast.error(`Erreur: ${err.message || 'Erreur inconnue'}`);
      
      // En cas d'erreur, restaurer l'état précédent
      await fetchProfiles();
    } finally {
      // Retirer l'ID de la liste des profils en cours de traitement
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(profileId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <Button onClick={fetchProfiles} variant="outline" disabled={loading}>
            <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </Button>
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
                              disabled={processingIds.has(profile.id)}
                              onCheckedChange={(checked) => {
                                handleCheckboxChange(profile.id, 'is_waiting', checked === true);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={profile.is_closed}
                              disabled={processingIds.has(profile.id)}
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
