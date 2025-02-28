
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
          <DialogDescription className="space-y-4">
            <p>
              Votre réservation a été enregistrée avec succès. Vous pouvez consulter ci-dessous l'ensemble des réservations pour vos enfants.
            </p>
            <p className="text-[#ea384c] font-medium">
              Merci de nous informer au plus tôt de toute absence de votre enfant afin d'attribuer la place à un enfant en liste d'attente.
            </p>
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
