
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
              Votre réservation a été enregistrée avec succès. 
              Vous pouvez consulter ci-dessous l'ensemble de vos réservations pour vos enfants.
            </p>
            <p className="text-[#ea384c] font-medium">
              Merci de nous prévenir dès que possible de toute absence de vos enfants afin de pouvoir faire profiter de la place à un enfant qui serait en liste d'attente.
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
