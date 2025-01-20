import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ReservationBadges } from "./ReservationBadges";
import { Tables } from "@/integrations/supabase/types";
import { CalendarDays, Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ReservationWithChild = Tables<"reservations"> & {
  children: Tables<"children">;
};

interface ReservationItemProps {
  reservation: ReservationWithChild;
  onUpdate: () => void;
}

export const ReservationItem = ({ reservation, onUpdate }: ReservationItemProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [withoutMeal, setWithoutMeal] = useState(reservation.without_meal || false);
  const [earlyDropoff, setEarlyDropoff] = useState(reservation.early_dropoff || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("reservations")
        .update({
          without_meal: withoutMeal,
          early_dropoff: earlyDropoff,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reservation.id);

      if (error) throw error;

      toast({
        title: "Réservation mise à jour",
        description: "La réservation a été modifiée avec succès.",
      });

      onUpdate();
      setIsDialogOpen(false);
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
    <>
      <div className="flex items-center justify-between p-3 transition-colors hover:bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
            <CalendarDays className="h-4 w-4 text-blue-500" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800">
                {format(new Date(reservation.reservation_date), "EEEE d MMMM yyyy", { locale: fr })}
              </span>
            </div>
            <ReservationBadges
              withoutMeal={reservation.without_meal || false}
              earlyDropoff={reservation.early_dropoff || false}
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDialogOpen(true)}
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4 text-blue-500" />
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