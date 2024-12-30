import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";

const Profile = () => {
  const { data: session } = await supabase.auth.getSession();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.session?.user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.session?.user?.id
  });

  if (isLoading) {
    return <div className="min-h-screen bg-secondary flex items-center justify-center">
      <p>Chargement...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end gap-4 mb-8">
            <Button asChild>
              <Link to="/reservation-mercredi">Réservation Mercredi</Link>
            </Button>
            <Button asChild>
              <Link to="/reservation-vacances">Réservation Vacances</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mon Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prénom</p>
                  <p className="text-lg">{profile?.first_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="text-lg">{profile?.last_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg">{session?.session?.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commune de scolarisation</p>
                  <p className="text-lg">{profile?.school_city || '-'}</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Liste des enfants</h3>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Prénom</TableHead>
                        <TableHead>Classe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Aucun enfant enregistré
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button asChild variant="outline">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;