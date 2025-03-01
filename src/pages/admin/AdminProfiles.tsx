
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileData } from "@/types/profile";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Loader2, AlertCircle, CheckSquare, XSquare, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const AdminProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState<boolean>(false);
  const [adminStatus, setAdminStatus] = useState<{isAdmin: boolean; userId: string | null; message: string}>({ 
    isAdmin: false, 
    userId: null,
    message: "Vérification des droits d'administrateur..."
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  useEffect(() => {
    async function checkAdminStatus() {
      try {
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

  useEffect(() => {
    if (profiles.length > 0) {
      applyFilters();
    }
  }, [searchQuery, paymentFilter, profiles]);

  const applyFilters = () => {
    let result = [...profiles];

    // Apply search filter (name or email)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(profile => 
        (profile.first_name && profile.first_name.toLowerCase().includes(query)) ||
        (profile.last_name && profile.last_name.toLowerCase().includes(query)) ||
        profile.email.toLowerCase().includes(query)
      );
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      const isAutomaticPayment = paymentFilter === "automatic";
      result = result.filter(profile => profile.automatic_payment === isAutomaticPayment);
    }

    setFilteredProfiles(result);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPaymentFilter("all");
  };

  const fetchAllProfiles = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Récupération de tous les profils avec emails...');
      
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

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId);
        
      if (updateError) {
        console.error('Erreur lors de la mise à jour via Supabase:', updateError);
        toast.error(`Erreur de mise à jour: ${updateError.message}`);
        fetchAllProfiles();
        return;
      }

      console.log('Mise à jour réussie');
      toast.success('Mise à jour réussie');

      fetchAllProfiles();

    } catch (err: any) {
      console.error('Exception lors de la mise à jour:', err);
      toast.error(`Erreur: ${err.message}`);
      fetchAllProfiles();
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(profileId);
        return newSet;
      });
    }
  };

  const handleBulkCheckboxChange = async (field: 'is_waiting' | 'is_closed') => {
    try {
      if (bulkProcessing) return;
      setBulkProcessing(true);
      
      const allChecked = profiles.every(profile => profile[field] === true);
      const newValue = !allChecked;

      const actionText = newValue ? 
        `marquer tous les profils comme "${field === 'is_waiting' ? 'En attente' : 'Fermé'}"` : 
        `désélectionner tous les profils "${field === 'is_waiting' ? 'En attente' : 'Fermé'}"`;
      
      if (!confirm(`Voulez-vous vraiment ${actionText} ?`)) {
        setBulkProcessing(false);
        return;
      }

      console.log(`Début de la mise à jour en masse pour le champ: ${field}, nouvelle valeur: ${newValue}`);
      
      setProfiles(prevProfiles =>
        prevProfiles.map(profile => ({
          ...profile,
          ...(field === 'is_waiting' ? { 
            is_waiting: newValue,
            ...(newValue ? { is_closed: false } : {})
          } : { 
            is_closed: newValue,
            ...(newValue ? { is_waiting: false } : {})
          })
        }))
      );

      const updates = {
        [field]: newValue,
        ...(field === 'is_waiting' && newValue ? { is_closed: false } : {}),
        ...(field === 'is_closed' && newValue ? { is_waiting: false } : {})
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .not('id', 'is', null);

      if (updateError) {
        console.error('Erreur lors de la mise à jour en masse:', updateError);
        toast.error(`Erreur de mise à jour en masse: ${updateError.message}`);
        fetchAllProfiles();
        return;
      }

      console.log('Mise à jour en masse réussie');
      toast.success(`Tous les profils ont été ${newValue ? 'marqués' : 'désélectionnés'} comme "${field === 'is_waiting' ? 'En attente' : 'Fermé'}"`);
      
      fetchAllProfiles();

    } catch (err: any) {
      console.error('Exception lors de la mise à jour en masse:', err);
      toast.error(`Erreur: ${err.message}`);
      fetchAllProfiles();
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleAutomaticPaymentChange = async (profileId: string, value: boolean) => {
    try {
      if (processingIds.has(profileId)) return;
      setProcessingIds(prev => new Set(prev).add(profileId));

      console.log('Updating automatic payment status for profile:', profileId);
      console.log('New value:', value);

      setProfiles(prevProfiles =>
        prevProfiles.map(profile =>
          profile.id === profileId
            ? { ...profile, automatic_payment: value }
            : profile
        )
      );

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ automatic_payment: value })
        .eq('id', profileId);
        
      if (updateError) {
        console.error('Error updating automatic payment status:', updateError);
        toast.error(`Erreur de mise à jour: ${updateError.message}`);
        fetchAllProfiles();
        return;
      }

      console.log('Automatic payment status updated successfully');
      toast.success('Mise à jour réussie');

      fetchAllProfiles();

    } catch (err: any) {
      console.error('Exception during update:', err);
      toast.error(`Erreur: ${err.message}`);
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
          <div className="flex gap-2">
            <Button 
              onClick={() => handleBulkCheckboxChange('is_waiting')} 
              variant="outline" 
              disabled={loading || bulkProcessing}
              className="flex items-center"
            >
              {filteredProfiles.every(p => p.is_waiting) ? (
                <XSquare className="h-4 w-4 mr-2" />
              ) : (
                <CheckSquare className="h-4 w-4 mr-2" />
              )}

              {bulkProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                filteredProfiles.every(p => p.is_waiting) ? "Désélectionner en attente" : "Tous en attente"
              )}
            </Button>
            <Button 
              onClick={() => handleBulkCheckboxChange('is_closed')} 
              variant="outline" 
              disabled={loading || bulkProcessing}
              className="flex items-center"
            >
              {filteredProfiles.every(p => p.is_closed) ? (
                <XSquare className="h-4 w-4 mr-2" />
              ) : (
                <CheckSquare className="h-4 w-4 mr-2" />
              )}
              
              {bulkProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                filteredProfiles.every(p => p.is_closed) ? "Désélectionner fermés" : "Tous fermés"
              )}
            </Button>
          </div>
        </div>
        
        {/* Filtres */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Recherche par nom ou email</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Rechercher..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Prélèvement automatique</Label>
                <Select
                  value={paymentFilter}
                  onValueChange={(value) => setPaymentFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par prélèvement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="automatic">Prélèvement automatique</SelectItem>
                    <SelectItem value="manual">Paiement manuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Liste des utilisateurs ({filteredProfiles.length} sur {profiles.length})</CardTitle>
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
                    {filteredProfiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProfiles.map((profile) => {
                        const isProcessing = processingIds.has(profile.id);
                        return (
                          <TableRow key={profile.id}>
                            <TableCell>{profile.last_name || '-'}</TableCell>
                            <TableCell>{profile.first_name || '-'}</TableCell>
                            <TableCell>{profile.email || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Switch
                                  checked={profile.automatic_payment}
                                  disabled={isProcessing || bulkProcessing}
                                  onCheckedChange={(checked) => {
                                    if (!isProcessing && !bulkProcessing) {
                                      handleAutomaticPaymentChange(profile.id, checked);
                                    }
                                  }}
                                />
                                {isProcessing && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Checkbox
                                  checked={profile.is_waiting}
                                  disabled={isProcessing || bulkProcessing}
                                  className={isProcessing || bulkProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                  onCheckedChange={(checked) => {
                                    if (!isProcessing && !bulkProcessing) {
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
                                  disabled={isProcessing || bulkProcessing}
                                  className={isProcessing || bulkProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                  onCheckedChange={(checked) => {
                                    if (!isProcessing && !bulkProcessing) {
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
