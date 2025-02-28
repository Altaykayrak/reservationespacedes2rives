
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileData } from "@/types/profile";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [adminStatus, setAdminStatus] = useState<{isAdmin: boolean; userId: string | null; message: string}>({ 
    isAdmin: false, 
    userId: null,
    message: "Vérification des droits d'administrateur..."
  });

  // Vérification du statut d'administrateur
  useEffect(() => {
    async function checkAdminStatus() {
      try {
        // Vérifier l'utilisateur connecté
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Erreur de récupération utilisateur:', userError);
          setAdminStatus({
            isAdmin: false,
            userId: null,
            message: `Erreur de récupération utilisateur: ${userError.message}`
          });
          return;
        }

        if (!user) {
          console.log('Aucun utilisateur connecté');
          setAdminStatus({
            isAdmin: false,
            userId: null,
            message: "Aucun utilisateur connecté"
          });
          return;
        }

        console.log('Utilisateur connecté:', user.id);
        
        // Vérifier si l'utilisateur est admin
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('is_admin', { user_id: user.id });

        if (adminError) {
          console.error('Erreur vérification admin:', adminError);
          setAdminStatus({
            isAdmin: false,
            userId: user.id,
            message: `Erreur vérification admin: ${adminError.message}`
          });
          return;
        }

        setAdminStatus({
          isAdmin: isAdmin || false,
          userId: user.id,
          message: `Utilisateur: ${user.id}, Admin: ${isAdmin}`
        });
        
        // Si l'utilisateur est admin, récupérer tous les profils
        if (isAdmin) {
          await fetchAllUsers();
        }
      } catch (err: any) {
        console.error('Erreur inattendue:', err);
        setAdminStatus({
          isAdmin: false,
          userId: null,
          message: `Erreur inattendue: ${err.message}`
        });
      }
    }

    checkAdminStatus();
  }, []);

  // Nouvelle méthode pour essayer d'obtenir tous les utilisateurs
  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Tentative de récupération de tous les utilisateurs...');
      
      // Essayer d'abord avec la fonction RPC
      const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
      
      if (authUsersError) {
        console.error('Accès admin refusé, utilisons une autre approche:', authUsersError);
        // Si l'accès admin est refusé, on essaie de récupérer les rôles utilisateurs
        await fetchUserRoles();
        return;
      }
      
      if (authUsers && authUsers.users && authUsers.users.length > 0) {
        console.log('Utilisateurs récupérés via admin API:', authUsers.users.length);
        
        // Nous avons récupéré les utilisateurs, maintenant récupérons leurs profils
        await fetchProfilesForUsers(authUsers.users.map(u => u.id));
      } else {
        console.log('Aucun utilisateur trouvé via admin API');
        // Essayons une autre approche
        await fetchProfilesDirectly();
      }
    } catch (err: any) {
      console.error('Erreur fetchAllUsers:', err);
      // En cas d'erreur, on essaie l'approche directe
      await fetchProfilesDirectly();
    }
  };

  // Récupération via les rôles utilisateurs
  const fetchUserRoles = async () => {
    try {
      console.log('Tentative de récupération via table user_roles...');
      
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (userRolesError) {
        console.error('Erreur récupération user_roles:', userRolesError);
        // Si erreur, on essaie l'approche directe
        await fetchProfilesDirectly();
        return;
      }
      
      if (userRoles && userRoles.length > 0) {
        console.log('Utilisateurs récupérés via user_roles:', userRoles.length);
        // Récupérer les profils pour ces utilisateurs
        await fetchProfilesForUsers(userRoles.map(ur => ur.user_id));
      } else {
        console.log('Aucun utilisateur trouvé via user_roles');
        await fetchProfilesDirectly();
      }
    } catch (err: any) {
      console.error('Erreur fetchUserRoles:', err);
      await fetchProfilesDirectly();
    }
  };

  // Récupération des profils pour des identifiants d'utilisateurs
  const fetchProfilesForUsers = async (userIds: string[]) => {
    try {
      console.log('Récupération des profils pour les utilisateurs:', userIds.length);
      
      // Récupérer les profils existants
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Erreur récupération profiles:', profilesError);
        await fetchProfilesDirectly(); // Essayer l'approche directe
        return;
      }

      console.log('Profils récupérés:', profilesData?.length || 0);

      if (profilesData && profilesData.length > 0) {
        const formattedProfiles: ProfileData[] = profilesData.map(profile => ({
          id: profile.id,
          email: "", // Pas d'email disponible ici
          first_name: profile.first_name || null,
          last_name: profile.last_name || null,
          automatic_payment: profile.automatic_payment || false,
          accepted_cgu: profile.accepted_cgu || false,
          is_waiting: profile.is_waiting || false,
          is_closed: profile.is_closed || false,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }));

        console.log('Nombre de profils formatés:', formattedProfiles.length);
        setProfiles(formattedProfiles);
      } else {
        console.log('Aucun profil trouvé via fetchProfilesForUsers');
        await fetchProfilesDirectly(); // Essayer l'approche directe
      }
    } catch (err: any) {
      console.error('Erreur fetchProfilesForUsers:', err);
      await fetchProfilesDirectly(); // Essayer l'approche directe
    } finally {
      setLoading(false);
    }
  };

  // Version simplifiée qui utilise uniquement la table profiles
  const fetchProfilesDirectly = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Récupération directe depuis la table profiles...');
      
      // Utilisation du token de service role pour contourner RLS si nécessaire
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Erreur récupération profiles:', profilesError);
        setError(`Erreur: ${profilesError.message}`);
        setLoading(false);
        return;
      }

      console.log('Profils récupérés directement:', profilesData);
      
      if (profilesData && profilesData.length > 0) {
        const formattedProfiles: ProfileData[] = profilesData.map(profile => ({
          id: profile.id,
          email: "", // Pas d'email disponible ici
          first_name: profile.first_name || null,
          last_name: profile.last_name || null,
          automatic_payment: profile.automatic_payment || false,
          accepted_cgu: profile.accepted_cgu || false,
          is_waiting: profile.is_waiting || false,
          is_closed: profile.is_closed || false,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }));

        console.log('Nombre de profils formatés:', formattedProfiles.length);
        setProfiles(formattedProfiles);
      } else {
        console.log('Aucun profil trouvé');
        setProfiles([]);
        setError("Aucun profil n'a été trouvé dans la base de données.");
      }
    } catch (err: any) {
      console.error('Erreur fetchProfilesDirectly:', err);
      setError(err.message || 'Une erreur est survenue lors de la récupération des profils.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = async (profileId: string, field: 'is_waiting' | 'is_closed', value: boolean) => {
    try {
      if (processingIds.has(profileId)) return;
      setProcessingIds(prev => new Set(prev).add(profileId));

      console.log('Début de la mise à jour pour le profil:', profileId);
      console.log('Champ à modifier:', field);
      console.log('Nouvelle valeur:', value);

      // Mettre à jour l'interface utilisateur immédiatement pour feedback instantané
      setProfiles(prevProfiles =>
        prevProfiles.map(profile =>
          profile.id === profileId
            ? { 
                ...profile, 
                [field]: value,
                ...(field === 'is_waiting' && value ? { is_closed: false } : {}),
                ...(field === 'is_closed' && value ? { is_waiting: false } : {})
              }
            : profile
        )
      );

      const updates = {
        [field]: value,
        ...(field === 'is_waiting' && value ? { is_closed: false } : {}),
        ...(field === 'is_closed' && value ? { is_waiting: false } : {})
      };

      console.log('Données de mise à jour:', updates);

      // Mise à jour du profil existant
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId);
        
      if (updateError) {
        console.error('Erreur lors de la mise à jour via Supabase:', updateError);
        toast.error(`Erreur de mise à jour: ${updateError.message}`);
        // Annuler le changement
        fetchProfilesDirectly();
        return;
      }

      console.log('Mise à jour réussie');
      toast.success('Mise à jour réussie');

      // Rafraîchir les données après une mise à jour réussie
      fetchProfilesDirectly();

    } catch (err: any) {
      console.error('Exception lors de la mise à jour:', err);
      toast.error(`Erreur: ${err.message}`);
      
      // Rafraîchir
      fetchProfilesDirectly();
    } finally {
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
          <Button onClick={fetchProfilesDirectly} variant="outline" disabled={loading}>
            <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </Button>
        </div>
        
        {/* Infos de débogage */}
        <Alert variant={adminStatus.isAdmin ? "default" : "destructive"} className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {adminStatus.isAdmin 
              ? `Connecté en tant qu'administrateur (${adminStatus.userId})` 
              : `Votre compte n'a pas les droits d'administrateur nécessaires. Détails: ${adminStatus.message}`}
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Liste des utilisateurs ({profiles.length})</CardTitle>
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
                      <TableHead>Prélèvement automatique</TableHead>
                      <TableHead>En attente</TableHead>
                      <TableHead>Fermé</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      profiles.map((profile) => {
                        const isProcessing = processingIds.has(profile.id);
                        return (
                          <TableRow key={profile.id}>
                            <TableCell>{profile.last_name || '-'}</TableCell>
                            <TableCell>{profile.first_name || '-'}</TableCell>
                            <TableCell>
                              <Switch 
                                checked={profile.automatic_payment} 
                                disabled
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Checkbox
                                  checked={profile.is_waiting}
                                  disabled={isProcessing}
                                  className={isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                  onCheckedChange={(checked) => {
                                    if (!isProcessing) {
                                      handleCheckboxChange(profile.id, 'is_waiting', checked === true);
                                    }
                                  }}
                                />
                                {isProcessing && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Checkbox
                                  checked={profile.is_closed}
                                  disabled={isProcessing}
                                  className={isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                  onCheckedChange={(checked) => {
                                    if (!isProcessing) {
                                      handleCheckboxChange(profile.id, 'is_closed', checked === true);
                                    }
                                  }}
                                />
                                {isProcessing && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                            </TableCell>
                          </TableRow>
                        );
                      })
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
