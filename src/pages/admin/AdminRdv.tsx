
import React, { useState, useEffect } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { fr } from "date-fns/locale";
import { Rdv } from "@/types/rdv";
import { format } from "date-fns";

const AdminRdv = () => {
  const { toast } = useToast();
  const [rdvList, setRdvList] = useState<Rdv[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [heureDebut, setHeureDebut] = useState("09:00");
  const [heureFin, setHeureFin] = useState("09:30");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");
        
        const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
        if (error) throw error;
        setIsAdmin(!!data);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    }
    
    checkAdmin();
  }, []);

  // Fetch all rdv
  useEffect(() => {
    async function fetchRdv() {
      if (!isAdmin) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('rdv')
          .select('*, profiles(first_name, last_name, email)')
          .order('date')
          .order('heure_debut');

        if (error) throw error;
        setRdvList(data || []);
      } catch (error) {
        console.error("Error fetching RDVs:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les rendez-vous",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchRdv();
  }, [isAdmin, toast]);

  const handleAddRdv = async () => {
    if (!date || !heureDebut || !heureFin) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs du formulaire",
        variant: "destructive",
      });
      return;
    }

    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('rdv')
        .insert([
          { 
            date: formattedDate,
            heure_debut: heureDebut,
            heure_fin: heureFin,
            status: 'disponible',
            motifs: [],
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le rendez-vous a été ajouté avec succès",
      });

      // Refetch RDVs
      const { data: newData, error: fetchError } = await supabase
        .from('rdv')
        .select('*, profiles(first_name, last_name, email)')
        .order('date')
        .order('heure_debut');

      if (fetchError) throw fetchError;
      setRdvList(newData || []);
    } catch (error) {
      console.error("Error adding RDV:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le rendez-vous",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRdv = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rdv')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le rendez-vous a été supprimé avec succès",
      });

      // Update local state
      setRdvList(rdvList.filter(rdv => rdv.id !== id));
    } catch (error) {
      console.error("Error deleting RDV:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rendez-vous",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };

  if (!isAdmin) {
    return (
      <div>
        <AdminNavbar />
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Accès non autorisé</h1>
          <p>Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Gestion des rendez-vous</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add RDV Form */}
          <Card>
            <CardHeader>
              <CardTitle>Ajouter un rendez-vous</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={fr}
                    className="mx-auto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="heureDebut">Heure de début</Label>
                    <Input
                      id="heureDebut"
                      type="time"
                      value={heureDebut}
                      onChange={(e) => setHeureDebut(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="heureFin">Heure de fin</Label>
                    <Input
                      id="heureFin"
                      type="time"
                      value={heureFin}
                      onChange={(e) => setHeureFin(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleAddRdv} className="w-full">
                  Ajouter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* RDV List */}
          <Card>
            <CardHeader>
              <CardTitle>Rendez-vous disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Chargement...</div>
              ) : rdvList.length === 0 ? (
                <div className="text-center py-4">Aucun rendez-vous disponible</div>
              ) : (
                <div className="space-y-4">
                  {rdvList.map((rdv) => (
                    <Card key={rdv.id} className="p-4 relative group">
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteRdv(rdv.id)}
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="text-red-500"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </Button>
                      </div>
                      <div>
                        <p className="font-semibold">{formatDate(rdv.date)}</p>
                        <p className="text-sm">{rdv.heure_debut.substring(0, 5)} - {rdv.heure_fin.substring(0, 5)}</p>
                        <p className="text-sm mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            rdv.status === 'disponible' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {rdv.status}
                          </span>
                        </p>
                        {rdv.status === 'réservé' && rdv.profiles && (
                          <div className="mt-2 text-sm">
                            <p>Réservé par: {rdv.profiles.first_name} {rdv.profiles.last_name}</p>
                            <p>Email: {rdv.profiles.email}</p>
                            <p>Motifs: {rdv.motifs.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRdv;
