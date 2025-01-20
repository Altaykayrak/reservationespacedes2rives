import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ReservationBadges } from "@/components/reservations/ReservationBadges";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Pencil, Trash2 } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const AdminReservations = () => {
  const { toast } = useToast();
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);
  const [editingReservation, setEditingReservation] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: reservations, refetch: refetchReservations } = useQuery({
    queryKey: ["admin_reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          children (
            first_name,
            last_name,
            school_class
          )
        `)
        .order('reservation_date', { ascending: true });
      
      if (error) throw error;
      console.log('Fetched reservations:', data);
      return data;
    },
  });

  const handleDelete = async () => {
    if (!reservationToDelete) return;

    try {
      console.log('Deleting reservation:', reservationToDelete);
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationToDelete);

      if (error) {
        console.error('Error deleting reservation:', error);
        throw error;
      }

      toast({
        title: "Réservation supprimée",
        description: "La réservation a été supprimée avec succès.",
      });

      await refetchReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la réservation.",
        variant: "destructive",
      });
    } finally {
      setReservationToDelete(null);
    }
  };

  const handleEdit = async (reservation: any) => {
    setEditingReservation({
      ...reservation,
      without_meal: Boolean(reservation.without_meal),
      early_dropoff: Boolean(reservation.early_dropoff),
    });
  };

  const handleUpdate = async () => {
    if (!editingReservation) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("reservations")
        .update({
          without_meal: editingReservation.without_meal,
          early_dropoff: editingReservation.early_dropoff,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingReservation.id);

      if (error) throw error;

      toast({
        title: "Réservation mise à jour",
        description: "La réservation a été modifiée avec succès.",
      });

      await refetchReservations();
      setEditingReservation(null);
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de la réservation.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Gestion des réservations</h1>

        <Card className="p-6">
          <div className="space-y-4">
            {reservations?.map((reservation) => (
              <div
                key={reservation.id}
                className="flex flex-col p-4 border rounded bg-white shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="font-medium text-lg">
                      {reservation.children?.first_name} {reservation.children?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Classe: {reservation.children?.school_class}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {format(new Date(reservation.reservation_date), "dd/MM/yyyy")}
                    </p>
                    <ReservationBadges 
                      withoutMeal={Boolean(reservation.without_meal)}
                      earlyDropoff={Boolean(reservation.early_dropoff)}
                    />
                    <p className="text-xs text-gray-500">
                      N° de réservation: {reservation.reservation_number}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Modifier la réservation"
                      onClick={() => handleEdit(reservation)}
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Supprimer la réservation"
                      onClick={() => setReservationToDelete(reservation.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <AlertDialog open={!!reservationToDelete} onOpenChange={() => setReservationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La réservation sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editingReservation} onOpenChange={() => setEditingReservation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la réservation</DialogTitle>
          </DialogHeader>
          {editingReservation && (
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="without-meal"
                    checked={editingReservation.without_meal}
                    onCheckedChange={(checked) => 
                      setEditingReservation({
                        ...editingReservation,
                        without_meal: checked,
                      })
                    }
                  />
                  <Label htmlFor="without-meal">Sans repas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="early-dropoff"
                    checked={editingReservation.early_dropoff}
                    onCheckedChange={(checked) => 
                      setEditingReservation({
                        ...editingReservation,
                        early_dropoff: checked,
                      })
                    }
                  />
                  <Label htmlFor="early-dropoff">Accueil avant 8h30</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingReservation(null)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button onClick={handleUpdate} disabled={isSubmitting}>
                  {isSubmitting ? "Modification..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReservations;