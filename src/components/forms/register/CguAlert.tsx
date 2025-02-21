
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CguAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CguAlert = ({ open, onOpenChange }: CguAlertProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conditions générales d'utilisation</DialogTitle>
          <DialogDescription>
            Vous devez accepter les conditions générales d'utilisation pour
            continuer votre inscription.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            D'accord
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
