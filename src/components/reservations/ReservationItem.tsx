
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type WednesdayReservationWithChild = Tables<"wednesday_reservations"> & {
  children: Tables<"children">;
  available_wednesdays: Tables<"available_wednesdays">;
};

interface ReservationItemProps {
  reservation: WednesdayReservationWithChild;
  onUpdate: () => void;
}

export const ReservationItem = ({ 
  reservation,
  onUpdate
}: ReservationItemProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [withoutMeal, setWithoutMeal] = useState(reservation.without_meal || false);
  const [earlyDropoff, setEarlyDropoff] = useState(reservation.early_dropoff || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("wednesday_reservations")
        .update({
          without_meal: withoutMeal,
          early_dropoff: earlyDropoff,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reservation.id);

      if (error) throw error;

      toast.success("Réservation mise à jour avec succès");
      onUpdate();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error("Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si les données ne sont pas complètement chargées, on affiche un message de chargement
  if (!reservation.available_wednesdays) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between p-3 transition-colors hover:bg-gray-50">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800">
            {format(new Date(reservation.available_wednesdays.date), "EEEE d MMMM yyyy", { locale: fr })}
          </span>
          <div className="flex flex-wrap gap-2 mt-1">
            {reservation.without_meal && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                Sans repas
              </span>
            )}
            {reservation.early_dropoff && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Accueil avant 8h30
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
        >
          Modifier
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la réservation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="without-meal"
                  checked={withoutMeal}
                  onCheckedChange={(checked) => setWithoutMeal(checked as boolean)}
                />
                <Label htmlFor="without-meal">Sans repas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="early-dropoff"
                  checked={earlyDropoff}
                  onCheckedChange={(checked) => setEarlyDropoff(checked as boolean)}
                />
                <Label htmlFor="early-dropoff">Accueil avant 8h30</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? "Modification..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
