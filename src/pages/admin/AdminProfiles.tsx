
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

  useEffect(() => {
    fetchProfiles();
  }, [automaticPaymentFilter, waitingFilter, closedFilter, searchQuery]);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);

    // Query from profiles_with_emails view instead of profiles table
    let query = supabase
      .from("profiles_with_emails")
      .select("*")
      .ilike("first_name", `%${searchQuery}%`)
      .order("created_at", { ascending: false });

    if (automaticPaymentFilter !== "all") {
      query = query.eq("automatic_payment", automaticPaymentFilter);
    }

    if (waitingFilter !== "all") {
      query = query.eq("is_waiting", waitingFilter);
    }

    if (closedFilter !== "all") {
      query = query.eq("is_closed", closedFilter);
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
      toast.error(`Erreur lors de la récupération des profils: ${error.message}`);
    } else {
      setProfiles(data || []);
    }

    setLoading(false);
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
                <div className="mb-4">
                  <Button onClick={() => exportProfilesToPDF(profiles)}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exporter en PDF
                  </Button>
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
