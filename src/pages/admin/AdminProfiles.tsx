
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileData } from "@/types/profile";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

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
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());

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
        
        // Si l'utilisateur est admin, récupérer la liste des admins et les profils
        if (isAdmin) {
          await fetchAdminUserIds();
          await fetchUserRoles(); // Nouvelle méthode pour récupérer tous les utilisateurs
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

  const fetchAdminUserIds = async () => {
    try {
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (error) {
        console.error('Erreur récupération admins:', error);
        return;
      }

      if (userRoles && userRoles.length > 0) {
        const adminIds = new Set(userRoles.map(user => user.user_id));
        console.log('IDs des administrateurs:', adminIds);
        setAdminUserIds(adminIds);
      }
    } catch (err) {
      console.error('Erreur fetch admin IDs:', err);
    }
  };

  // Nouvelle méthode pour récupérer tous les utilisateurs via user_roles
  const fetchUserRoles = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Récupération des utilisateurs depuis user_roles...');
      
      // Récupérer tous les utilisateurs via user_roles
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (userRolesError) {
        console.error('Erreur récupération user_roles:', userRolesError);
        throw userRolesError;
      }

      console.log('Utilisateurs récupérés depuis user_roles:', userRolesData);

      if (!userRolesData || userRolesData.length === 0) {
        console.log('Aucun utilisateur trouvé');
        setProfiles([]);
        setLoading(false);
        return;
      }

      // On extrait les IDs pour récupérer les profils correspondants
      const userIds = userRolesData.map(user => user.user_id);

      // Récupérer les détails des profils pour ces utilisateurs
      await fetchProfilesForUsers(userIds, userRolesData);
      
    } catch (err: any) {
      console.error('Erreur fetchUserRoles:', err);
      setError(err.message || 'Une erreur est survenue lors de la récupération des utilisateurs.');
      setLoading(false);
    }
  };

  // Récupère les profils pour une liste d'utilisateurs
  const fetchProfilesForUsers = async (userIds: string[], userRolesData: any[]) => {
    try {
      console.log('Récupération des profils pour les utilisateurs:', userIds);
      
      // Récupérer les profils existants
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        console.error('Erreur récupération profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profils récupérés:', profilesData || []);

      // Créer un mapping entre les IDs et les profils
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Créer des objets ProfileData pour tous les utilisateurs
      const formattedProfiles: ProfileData[] = userIds.map(userId => {
        const userRole = userRolesData.find(ur => ur.user_id === userId);
        const profile = profilesMap.get(userId) || { 
          id: userId,
          first_name: null,
          last_name: null,
          automatic_payment: false,
          accepted_cgu: false,
          is_waiting: false,
          is_closed: false,
          created_at: userRole?.created_at,
          updated_at: userRole?.updated_at
        };

        return {
          id: userId,
          email: userRole?.email || "",
          first_name: profile.first_name || null,
          last_name: profile.last_name || null,
          automatic_payment: profile.automatic_payment || false,
          accepted_cgu: profile.accepted_cgu || false,
          is_waiting: profile.is_waiting || false,
          is_closed: profile.is_closed || false,
          created_at: profile.created_at || userRole?.created_at || new Date().toISOString(),
          updated_at: profile.updated_at || userRole?.updated_at || new Date().toISOString()
        };
      });

      console.log('Profils formatés:', formattedProfiles);
      setProfiles(formattedProfiles);
    } catch (err: any) {
      console.error('Erreur fetchProfilesForUsers:', err);
      setError(err.message || 'Une erreur est survenue lors de la récupération des profils.');
    } finally {
      setLoading(false);
    }
  };

  // Cette fonction n'est plus utilisée directement
  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Début de récupération des profils...');
      
      // Récupérer tous les profils directement
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Erreur récupération profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profils récupérés:', profilesData);
      
      if (profilesData && profilesData.length > 0) {
        // Créer des objets ProfileData pour chaque profil
        const formattedProfiles: ProfileData[] = profilesData.map(profile => ({
          id: profile.id,
          email: "", // On n'affiche pas l'email
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
      }
    } catch (err: any) {
      console.error('Erreur fetchProfiles:', err);
      setError(err.message || 'Une erreur est survenue lors de la récupération des profils.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = async (profileId: string, field: 'is_waiting' | 'is_closed', value: boolean) => {
    try {
      // Empêcher la modification d'un compte admin
      if (adminUserIds.has(profileId)) {
        toast.error("Impossible de modifier un compte administrateur");
        return;
      }

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

      // Vérifier si un profil existe déjà pour cet utilisateur
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', profileId)
        .maybeSingle();
        
      if (fetchError) {
        console.error('Erreur lors de la vérification du profil:', fetchError);
        toast.error(`Erreur de vérification: ${fetchError.message}`);
        return;
      }

      let updateOperation;

      if (existingProfile) {
        // Mise à jour du profil existant
        console.log('Mise à jour du profil existant:', profileId);
        updateOperation = supabase
          .from('profiles')
          .update(updates)
          .eq('id', profileId);
      } else {
        // Création d'un nouveau profil car il n'en existe pas encore
        console.log('Création d\'un nouveau profil:', profileId);
        updateOperation = supabase
          .from('profiles')
          .insert({
            id: profileId,
            first_name: null,
            last_name: null,
            automatic_payment: false,
            accepted_cgu: false,
            ...updates
          });
      }

      const { error: updateError } = await updateOperation;
        
      if (updateError) {
        console.error('Erreur lors de la mise à jour via Supabase:', updateError);
        toast.error(`Erreur de mise à jour: ${updateError.message}`);
        // Annuler le changement
        fetchUserRoles();
        return;
      }

      console.log('Mise à jour réussie');
      toast.success('Mise à jour réussie');

      // Rafraîchir les données après une mise à jour réussie
      fetchUserRoles();

    } catch (err: any) {
      console.error('Exception lors de la mise à jour:', err);
      toast.error(`Erreur: ${err.message}`);
      
      // Rafraîchir
      fetchUserRoles();
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(profileId);
        return newSet;
      });
    }
  };

  const isAdmin = (profileId: string): boolean => {
    return adminUserIds.has(profileId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <Button onClick={fetchUserRoles} variant="outline" disabled={loading}>
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
                      <TableHead>Rôle</TableHead>
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
                      profiles.map((profile) => {
                        const isUserAdmin = isAdmin(profile.id);
                        const isProcessing = processingIds.has(profile.id);
                        return (
                          <TableRow 
                            key={profile.id} 
                            className={isUserAdmin ? "bg-slate-50" : ""}
                          >
                            <TableCell>{profile.last_name || '-'}</TableCell>
                            <TableCell>{profile.first_name || '-'}</TableCell>
                            <TableCell>
                              {isUserAdmin ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center">
                                  <ShieldCheck className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                              ) : 'Utilisateur'}
                            </TableCell>
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
                                  disabled={isProcessing || isUserAdmin}
                                  className={(isProcessing || isUserAdmin) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                  onCheckedChange={(checked) => {
                                    if (!isProcessing && !isUserAdmin) {
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
                                  disabled={isProcessing || isUserAdmin}
                                  className={(isProcessing || isUserAdmin) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                  onCheckedChange={(checked) => {
                                    if (!isProcessing && !isUserAdmin) {
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
