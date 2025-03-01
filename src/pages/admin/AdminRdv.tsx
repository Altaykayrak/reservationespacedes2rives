
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, parse, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/components/admin/reservations/hooks/useAdminAuth";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rdv, RdvFormValues, MOTIFS_OPTIONS } from "@/types/rdv";

export default function AdminRdvPage() {
  const { data: isAdmin, isLoading: isAdminLoading } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [rdvList, setRdvList] = useState<Rdv[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [formValues, setFormValues] = useState<RdvFormValues>({
    date: new Date(),
    heure_debut: "09:00",
    heure_fin: "10:00",
  });
  
  const [selectedRdv, setSelectedRdv] = useState<Rdv | null>(null);

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
      navigate("/admin-login");
    }
  }, [isAdmin, isAdminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchRdvs();
    }
  }, [isAdmin]);

  const fetchRdvs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rdv')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
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
      setIsLoading(false);
    }
  };

  const handleCreateRdv = async () => {
    try {
      setIsLoading(true);
      
      if (!formValues.date || !formValues.heure_debut || !formValues.heure_fin) {
        toast({
          title: "Données manquantes",
          description: "Veuillez remplir tous les champs",
          variant: "destructive",
        });
        return;
      }
      
      const formattedDate = format(formValues.date, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('rdv')
        .insert({
          date: formattedDate,
          heure_debut: formValues.heure_debut,
          heure_fin: formValues.heure_fin,
          status: 'disponible'
        });

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Le créneau a été créé avec succès",
      });
      
      setShowCreateDialog(false);
      fetchRdvs();
    } catch (error) {
      console.error("Error creating RDV:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le créneau",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRdv = async () => {
    if (!selectedRdv) return;
    
    try {
      setIsLoading(true);
      
      if (!formValues.date || !formValues.heure_debut || !formValues.heure_fin) {
        toast({
          title: "Données manquantes",
          description: "Veuillez remplir tous les champs",
          variant: "destructive",
        });
        return;
      }
      
      const formattedDate = format(formValues.date, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('rdv')
        .update({
          date: formattedDate,
          heure_debut: formValues.heure_debut,
          heure_fin: formValues.heure_fin
        })
        .eq('id', selectedRdv.id);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Le créneau a été mis à jour avec succès",
      });
      
      setShowEditDialog(false);
      fetchRdvs();
    } catch (error) {
      console.error("Error updating RDV:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le créneau",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRdv = async () => {
    if (!selectedRdv) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('rdv')
        .delete()
        .eq('id', selectedRdv.id);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Le créneau a été supprimé avec succès",
      });
      
      setShowDeleteDialog(false);
      fetchRdvs();
    } catch (error) {
      console.error("Error deleting RDV:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le créneau",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetStatus = async (rdv: Rdv) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('rdv')
        .update({
          status: 'disponible',
          user_id: null,
          motifs: []
        })
        .eq('id', rdv.id);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Le rendez-vous a été réinitialisé avec succès",
      });
      
      fetchRdvs();
    } catch (error) {
      console.error("Error resetting RDV:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser le rendez-vous",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'dd/MM/yyyy', { locale: fr });
  };

  const formatTime = (timeStr: string) => {
    // Convert "HH:mm:ss" to "HH:mm"
    return timeStr.substring(0, 5);
  };

  if (isAdminLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <main className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des rendez-vous</h1>
          <Button onClick={() => {
            setFormValues({
              date: new Date(),
              heure_debut: "09:00",
              heure_fin: "10:00"
            });
            setShowCreateDialog(true);
          }}>
            Ajouter un créneau
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Liste des créneaux</CardTitle>
          </CardHeader>
          <CardContent>
            {rdvList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun créneau n'a été créé.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setShowCreateDialog(true)}
                >
                  Créer un créneau
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Horaire</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Motifs</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rdvList.map((rdv) => (
                    <TableRow key={rdv.id}>
                      <TableCell>{formatDate(rdv.date)}</TableCell>
                      <TableCell>{formatTime(rdv.heure_debut)} - {formatTime(rdv.heure_fin)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          rdv.status === 'disponible' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {rdv.status === 'disponible' ? 'Disponible' : 'Réservé'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {rdv.profiles ? (
                          <div>
                            <p>{rdv.profiles.first_name} {rdv.profiles.last_name}</p>
                            <p className="text-xs text-gray-500">{rdv.profiles.email}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {rdv.motifs && rdv.motifs.length > 0 ? (
                          <div className="space-y-1">
                            {rdv.motifs.map(motif => (
                              <div key={motif} className="text-xs bg-gray-100 rounded px-2 py-1 inline-block mr-1">
                                {motif}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRdv(rdv);
                              setFormValues({
                                date: parse(rdv.date, 'yyyy-MM-dd', new Date()),
                                heure_debut: formatTime(rdv.heure_debut),
                                heure_fin: formatTime(rdv.heure_fin)
                              });
                              setShowEditDialog(true);
                            }}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedRdv(rdv);
                              setShowDeleteDialog(true);
                            }}
                          >
                            Supprimer
                          </Button>
                          {rdv.status === 'réservé' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResetStatus(rdv)}
                            >
                              Réinitialiser
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create RDV Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un créneau</DialogTitle>
              <DialogDescription>
                Définissez la date et l'horaire du nouveau créneau.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Calendar
                  mode="single"
                  selected={formValues.date}
                  onSelect={(date) => date && setFormValues({...formValues, date})}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heure_debut">Heure de début</Label>
                  <Input
                    id="heure_debut"
                    type="time"
                    value={formValues.heure_debut}
                    onChange={(e) => setFormValues({...formValues, heure_debut: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heure_fin">Heure de fin</Label>
                  <Input
                    id="heure_fin"
                    type="time"
                    value={formValues.heure_fin}
                    onChange={(e) => setFormValues({...formValues, heure_fin: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCreateRdv}
                disabled={isLoading}
              >
                {isLoading ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit RDV Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier le créneau</DialogTitle>
              <DialogDescription>
                Modifiez la date et l'horaire du créneau sélectionné.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Calendar
                  mode="single"
                  selected={formValues.date}
                  onSelect={(date) => date && setFormValues({...formValues, date})}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heure_debut">Heure de début</Label>
                  <Input
                    id="heure_debut"
                    type="time"
                    value={formValues.heure_debut}
                    onChange={(e) => setFormValues({...formValues, heure_debut: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heure_fin">Heure de fin</Label>
                  <Input
                    id="heure_fin"
                    type="time"
                    value={formValues.heure_fin}
                    onChange={(e) => setFormValues({...formValues, heure_fin: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleUpdateRdv}
                disabled={isLoading}
              >
                {isLoading ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmation de suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce créneau ?
                {selectedRdv && selectedRdv.status === 'réservé' && (
                  <div className="mt-2 text-red-600 font-medium">
                    Attention : Ce créneau est déjà réservé.
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRdv}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600"
              >
                {isLoading ? "Suppression..." : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
