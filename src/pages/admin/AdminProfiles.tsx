import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileData } from "@/types/profile";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Loader2, AlertCircle, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { exportProfilesToPDF } from "@/components/admin/profiles/export/profilesPdfExport";

const AdminProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [automaticPaymentFilter, setAutomaticPaymentFilter] = useState<"all" | boolean>("all");
  const [waitingFilter, setWaitingFilter] = useState<"all" | boolean>("all");
  const [closedFilter, setClosedFilter] = useState<"all" | boolean>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [automaticPaymentFilter, waitingFilter, closedFilter, searchQuery]);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);

    console.log("Fetching profiles...");

    try {
      // Verify admin status first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError("Aucune session utilisateur trouvée");
        setLoading(false);
        return;
      }

      console.log("Got session, checking admin status:", session.user.id);
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', { user_id: session.user.id });
      
      if (adminError) {
        console.error("Error checking admin status:", adminError);
        setError("Erreur lors de la vérification des droits administrateur");
        setLoading(false);
        return;
      }
      
      console.log("Admin check result:", isAdmin);
      
      if (!isAdmin) {
        console.error("User is not an admin");
        setError("Vous n'avez pas les droits d'administrateur");
        setLoading(false);
        return;
      }

      console.log("Admin check passed, fetching profiles directly");

      // Fetch profiles data first
      let profilesQuery = supabase
        .from("profiles")
        .select("*");

      if (searchQuery) {
        profilesQuery = profilesQuery.ilike("first_name", `%${searchQuery}%`);
      }

      profilesQuery = profilesQuery.order("created_at", { ascending: false });

      if (automaticPaymentFilter !== "all") {
        profilesQuery = profilesQuery.eq("automatic_payment", automaticPaymentFilter);
      }

      if (waitingFilter !== "all") {
        profilesQuery = profilesQuery.eq("is_waiting", waitingFilter);
      }

      if (closedFilter !== "all") {
        profilesQuery = profilesQuery.eq("is_closed", closedFilter);
      }

      const { data: profilesData, error: profilesError } = await profilesQuery;

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        setError(`Erreur lors de la récupération des profils: ${profilesError.message}`);
        setLoading(false);
        return;
      }

      console.log("Profiles fetched successfully:", profilesData?.length || 0, "profiles");

      // Now fetch emails from auth.users table using admin RPC function
      if (profilesData && profilesData.length > 0) {
        const userIds = profilesData.map(profile => profile.id);
        console.log("Fetching emails for user IDs:", userIds);
        
        const { data: emailsData, error: emailsError } = await supabase.rpc('get_user_emails', { user_ids: userIds });
        
        if (emailsError) {
          console.error("Error fetching emails:", emailsError);
          // Continue with profiles data but no emails
          setProfiles(profilesData);
        } else if (emailsData) {
          console.log("Emails fetched successfully:", emailsData.length, "emails");
          // Combine profiles with emails
          const profilesWithEmails = profilesData.map(profile => {
            const userEmail = emailsData.find(item => item.id === profile.id);
            return {
              ...profile,
              email: userEmail ? userEmail.email : 'Email non disponible'
            };
          });
          setProfiles(profilesWithEmails);
        } else {
          // If no emails data, just use profiles
          setProfiles(profilesData);
        }
      } else {
        setProfiles([]);
      }
    } catch (error) {
      console.error("Exception in fetchProfiles:", error);
      if (error instanceof Error) {
        setError(error.message);
        toast.error(`Erreur: ${error.message}`);
      } else {
        setError("Une erreur inconnue est survenue");
        toast.error("Une erreur inconnue est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAutomaticPaymentChange = async (id: string, automatic_payment: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ automatic_payment: !automatic_payment })
      .eq("id", id);

    if (error) {
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } else {
      fetchProfiles();
      toast.success("Profil mis à jour avec succès!");
    }
  };

  const handleWaitingChange = async (id: string, is_waiting: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_waiting: !is_waiting })
      .eq("id", id);

    if (error) {
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } else {
      fetchProfiles();
      toast.success("Profil mis à jour avec succès!");
    }
  };

  const handleClosedChange = async (id: string, is_closed: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_closed: !is_closed })
      .eq("id", id);

    if (error) {
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } else {
      fetchProfiles();
      toast.success("Profil mis à jour avec succès!");
    }
  };

  const handleBulkWaitingChange = async (value: boolean) => {
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_waiting: value })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all profiles

      if (error) {
        toast.error(`Erreur lors de la mise à jour des profils: ${error.message}`);
      } else {
        fetchProfiles();
        toast.success(`Tous les profils ont été mis ${value ? 'en attente' : 'hors attente'} avec succès!`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Erreur: ${error.message}`);
      }
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkClosedChange = async (value: boolean) => {
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_closed: value })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all profiles

      if (error) {
        toast.error(`Erreur lors de la mise à jour des profils: ${error.message}`);
      } else {
        fetchProfiles();
        toast.success(`Tous les profils ont été ${value ? 'fermés' : 'ouverts'} avec succès!`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Erreur: ${error.message}`);
      }
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Liste des utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 mb-4 grid-cols-1 md:grid-cols-4">
              <div>
                <Label htmlFor="search">Rechercher par nom:</Label>
                <Input
                  type="text"
                  id="search"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Label>Prélèvement automatique:</Label>
                <Select value={automaticPaymentFilter.toString()} onValueChange={(value) => setAutomaticPaymentFilter(value === "all" ? "all" : value === "true")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="true">Oui</SelectItem>
                    <SelectItem value="false">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>En attente:</Label>
                <Select value={waitingFilter.toString()} onValueChange={(value) => setWaitingFilter(value === "all" ? "all" : value === "true")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="true">Oui</SelectItem>
                    <SelectItem value="false">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fermé:</Label>
                <Select value={closedFilter.toString()} onValueChange={(value) => setClosedFilter(value === "all" ? "all" : value === "true")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="true">Oui</SelectItem>
                    <SelectItem value="false">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => exportProfilesToPDF(profiles)}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exporter en PDF
                  </Button>
                  
                  <div className="space-x-2">
                    <Button 
                      onClick={() => handleBulkWaitingChange(true)} 
                      variant="outline" 
                      disabled={bulkActionLoading}
                    >
                      {bulkActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Tous en attente
                    </Button>
                    <Button 
                      onClick={() => handleBulkWaitingChange(false)} 
                      variant="outline"
                      disabled={bulkActionLoading}
                    >
                      {bulkActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Aucun en attente
                    </Button>
                  </div>
                  
                  <div className="space-x-2">
                    <Button 
                      onClick={() => handleBulkClosedChange(true)} 
                      variant="outline"
                      disabled={bulkActionLoading}
                    >
                      {bulkActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Tous fermés
                    </Button>
                    <Button 
                      onClick={() => handleBulkClosedChange(false)} 
                      variant="outline"
                      disabled={bulkActionLoading}
                    >
                      {bulkActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Aucun fermé
                    </Button>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Prélèvement automatique</TableHead>
                      <TableHead>En attente</TableHead>
                      <TableHead>Fermé</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>{profile.last_name}</TableCell>
                        <TableCell>{profile.first_name}</TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>
                          <Switch
                            checked={profile.automatic_payment}
                            onCheckedChange={() => handleAutomaticPaymentChange(profile.id, profile.automatic_payment)}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={profile.is_waiting}
                            onCheckedChange={() => handleWaitingChange(profile.id, profile.is_waiting)}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={profile.is_closed}
                            onCheckedChange={() => handleClosedChange(profile.id, profile.is_closed)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfiles;
