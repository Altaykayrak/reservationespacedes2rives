
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
          await fetchAllProfiles();
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

  // Méthode simplifiée pour récupérer tous les profils avec emails
  const fetchAllProfiles = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Récupération de tous les profils avec emails...');
      
      // Utilisation de la vue profiles_with_emails qui inclut les emails
      // Tri par nom de famille directement dans la requête
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles_with_emails')
        .select('*')
        .order('last_name', { ascending: true });

      if (profilesError) {
        console.error('Erreur récupération profiles:', profilesError);
        setError(`Erreur: ${profilesError.message}`);
        setLoading(false);
        return;
      }

      console.log('Profils récupérés avec emails:', profilesData);
      
      if (profilesData && profilesData.length > 0) {
        const formattedProfiles: ProfileData[] = profilesData.map(profile => ({
          id: profile.id || '',
          email: profile.email || '',
          first_name: profile.first_name || null,
          last_name: profile.last_name || null,
          automatic_payment: profile.automatic_payment || false,
          accepted_cgu: profile.accepted_cgu || false,
          is_waiting: profile.is_waiting || false,
          is_closed: profile.is_closed || false,
          created_at: profile.created_at || '',
          updated_at: profile.updated_at || ''
        }));

        console.log('Nombre de profils formatés:', formattedProfiles.length);
        setProfiles(formattedProfiles);
      } else {
        console.log('Aucun profil trouvé');
        setProfiles([]);
        setError("Aucun profil n'a été trouvé dans la base de données.");
      }
    } catch (err: any) {
      console.error('Erreur fetchAllProfiles:', err);
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
        fetchAllProfiles();
        return;
      }

      console.log('Mise à jour réussie');
      toast.success('Mise à jour réussie');

      // Rafraîchir les données après une mise à jour réussie
      fetchAllProfiles();

    } catch (err: any) {
      console.error('Exception lors de la mise à jour:', err);
      toast.error(`Erreur: ${err.message}`);
      
      // Rafraîchir
      fetchAllProfiles();
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
          <Button onClick={fetchAllProfiles} variant="outline" disabled={loading}>
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
                      profiles.map((profile) => {
                        const isProcessing = processingIds.has(profile.id);
                        return (
                          <TableRow key={profile.id}>
                            <TableCell>{profile.last_name || '-'}</TableCell>
                            <TableCell>{profile.first_name || '-'}</TableCell>
                            <TableCell>{profile.email || '-'}</TableCell>
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
