import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Rdv, MOTIFS_OPTIONS } from "@/types/rdv";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Navbar } from "@/components/ui/navbar";

export default function RdvPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rdvList, setRdvList] = useState<Rdv[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRdv, setSelectedRdv] = useState<Rdv | null>(null);
  const [selectedMotifs, setSelectedMotifs] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reservationComplete, setReservationComplete] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRdvs();
    }
  }, [user]);

  const fetchRdvs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rdv')
        .select('*')
        .eq('status', 'disponible')
        .order('date')
        .order('heure_debut');

      if (error) throw error;
      setRdvList(data as unknown as Rdv[]);
    } catch (error) {
      console.error("Error fetching RDVs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les créneaux disponibles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMotifChange = (motif: string) => {
    setSelectedMotifs((prev) => {
      if (prev.includes(motif)) {
        return prev.filter((m) => m !== motif);
      }
      return [...prev, motif];
    });
  };

  const handleReservation = async () => {
    if (!user || !selectedRdv || selectedMotifs.length === 0) {
      toast({
        title: "Information requise",
        description: "Veuillez sélectionner au moins un motif",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Mise à jour du créneau en base de données
      const { error } = await supabase
        .from('rdv')
        .update({
          user_id: user.id,
          motifs: selectedMotifs,
          status: 'réservé'
        })
        .eq('id', selectedRdv.id);

      if (error) throw error;

      // Envoi de l'email de confirmation
      const { error: emailError } = await supabase.functions.invoke('send-reservation-email', {
        body: {
          rdvId: selectedRdv.id,
          motifs: selectedMotifs,
          userId: user.id
        }
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
      }

      setShowConfirmDialog(false);
      setReservationComplete(true);
      
      toast({
        title: "Réservation confirmée",
        description: "Votre rendez-vous a été réservé avec succès",
      });
    } catch (error) {
      console.error("Error making reservation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer la réservation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };

  const formatTime = (timeStr: string) => {
    // Convert "HH:mm:ss" to "HH:mm"
    return timeStr.substring(0, 5);
  };

  if (loading || isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Prise de rendez-vous</h1>
          <p className="text-gray-600">
            Sélectionnez un créneau disponible pour prendre rendez-vous
          </p>
        </div>

        {rdvList.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Aucun créneau disponible pour le moment.</p>
                <p className="text-gray-500">
                  Veuillez revenir ultérieurement ou contacter l'administration.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rdvList.map((rdv) => (
              <Card 
                key={rdv.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedRdv(rdv);
                  setSelectedMotifs([]);
                  setShowConfirmDialog(true);
                }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {formatDate(rdv.date)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    De {formatTime(rdv.heure_debut)} à {formatTime(rdv.heure_fin)}
                  </p>
                  <Button className="w-full mt-4">
                    Sélectionner ce créneau
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog de confirmation de réservation */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmer votre rendez-vous</DialogTitle>
              <DialogDescription>
                {selectedRdv && (
                  <p className="my-2">
                    {formatDate(selectedRdv.date)} de {formatTime(selectedRdv.heure_debut)} à {formatTime(selectedRdv.heure_fin)}
                  </p>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <h3 className="mb-2 font-medium">Sélectionnez le(s) motif(s) du rendez-vous :</h3>
              <div className="space-y-3 mt-4">
                {MOTIFS_OPTIONS.map((motif) => (
                  <div key={motif} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`motif-${motif}`} 
                      checked={selectedMotifs.includes(motif)}
                      onCheckedChange={() => handleMotifChange(motif)}
                    />
                    <label htmlFor={`motif-${motif}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {motif}
                    </label>
                  </div>
                ))}
              </div>
              
              {selectedMotifs.length === 0 && (
                <p className="text-red-500 text-sm mt-2">
                  Veuillez sélectionner au moins un motif
                </p>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleReservation} 
                disabled={selectedMotifs.length === 0 || isLoading}
              >
                {isLoading ? "Confirmation..." : "Confirmer la réservation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de récapitulatif après réservation */}
        <Dialog open={reservationComplete} onOpenChange={setReservationComplete}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rendez-vous confirmé</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {selectedRdv && (
                <>
                  <h3 className="font-medium">Détails du rendez-vous :</h3>
                  <p className="mt-2">
                    <strong>Date :</strong> {formatDate(selectedRdv.date)}
                  </p>
                  <p>
                    <strong>Heure :</strong> {formatTime(selectedRdv.heure_debut)} - {formatTime(selectedRdv.heure_fin)}
                  </p>
                  <p>
                    <strong>Motif(s) :</strong> {selectedMotifs.join(", ")}
                  </p>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="font-medium mb-2">Documents à apporter :</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Justificatif de domicile</li>
                      <li>Carnet de santé (si nouveaux vaccins)</li>
                      <li>Quotient familial CAF ou avis d'imposition N-2</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button 
                onClick={() => {
                  setReservationComplete(false);
                  fetchRdvs();
                }}
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
