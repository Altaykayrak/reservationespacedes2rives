
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WednesdayReservationWithChild } from "./hooks/useAdminReservations";

interface EditReservationDialogProps {
  reservation: WednesdayReservationWithChild | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  isSubmitting: boolean;
  withoutMeal: boolean;
  earlyDropoff: boolean;
  onWithoutMealChange: (checked: boolean) => void;
  onEarlyDropoffChange: (checked: boolean) => void;
}

export const EditReservationDialog = ({
  isOpen,
  onClose,
  onUpdate,
  isSubmitting,
  withoutMeal,
  earlyDropoff,
  onWithoutMealChange,
  onEarlyDropoffChange,
}: EditReservationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                onCheckedChange={onWithoutMealChange}
              />
              <Label htmlFor="without-meal">Sans repas</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="early-dropoff"
                checked={earlyDropoff}
                onCheckedChange={onEarlyDropoffChange}
              />
              <Label htmlFor="early-dropoff">Accueil avant 8h30</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button onClick={onUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Modification..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
