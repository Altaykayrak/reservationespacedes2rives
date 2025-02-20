
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SuccessReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SuccessReservationDialog = ({
  open,
  onOpenChange,
}: SuccessReservationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réservation confirmée</DialogTitle>
          <DialogDescription>
            Votre réservation a été enregistrée avec succès. 
            Vous pouvez consulter ci-dessous l'ensemble de vos réservations pour vos enfants.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
