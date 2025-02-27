
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

// Constants for Supabase
const SUPABASE_URL = "https://dddtybmradplydzymrly.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZHR5Ym1yYWRwbHlkenltcmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MTMyOTYsImV4cCI6MjA1MTA4OTI5Nn0.WMyVzGwkQlg3YZOu-N_rxI1hDuf5lFO_kntzhD3GKLI";

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

        // Vérifier les droits avec un test simple - modification de cette partie
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('id')  // Sélectionner seulement l'ID au lieu de count(*)
          .limit(1);     // Limiter à 1 résultat

        let testMessage = '';
        if (testError) {
          testMessage = `Test d'accès échoué: ${testError.message}`;
          console.error('Test d\'accès échoué:', testError);
        } else {
          testMessage = `Test d'accès réussi, résultat: ${JSON.stringify(testData)}`;
          console.log('Test d\'accès réussi:', testData);
        }

        setAdminStatus({
          isAdmin: isAdmin || false,
          userId: user.id,
          message: `Utilisateur: ${user.id}, Admin: ${isAdmin}, ${testMessage}`
        });
        
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

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Début de récupération des profils...');
      const { data, error: fetchError } = await supabase
        .from('profiles_with_emails')
        .select('*');

      if (fetchError) {
        console.error('Erreur Supabase:', fetchError);
        throw fetchError;
      }

      console.log('Données reçues:', data);

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
        console.log('Profils formatés:', formattedProfiles.length);
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

      // Utiliser PATCH pour mettre à jour la table profiles directement
      // Attention : utilisation de l'API fetch native pour plus de contrôle
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${profileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erreur HTTP lors de la mise à jour:', response.status, errorData);
        // Annuler le changement dans l'interface en cas d'erreur
        fetchProfiles();
        toast.error(`Erreur de mise à jour: ${response.status} ${errorData}`);
        return;
      }

      console.log('Mise à jour réussie, statut:', response.status);
      toast.success('Mise à jour réussie');

      // Rafraîchir les données après une mise à jour réussie pour confirmer les changements
      setTimeout(() => {
        fetchProfiles();
      }, 1000); // Attendre 1 seconde avant de rafraîchir pour donner le temps à la BD de se mettre à jour

    } catch (err: any) {
      console.error('Exception lors de la mise à jour:', err);
      toast.error(`Erreur: ${err.message}`);
      
      // Rafraîchir pour s'assurer que l'interface est synchronisée avec la base de données
      fetchProfiles();
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
          <Button onClick={fetchProfiles} variant="outline" disabled={loading}>
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
                      profiles.map((profile) => {
                        const isProcessing = processingIds.has(profile.id);
                        return (
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
