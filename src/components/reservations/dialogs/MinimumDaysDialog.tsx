
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MinimumDaysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MinimumDaysDialog = ({
  open,
  onOpenChange,
}: MinimumDaysDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sélection minimum requise</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Vous devez sélectionner au minimum 3 jours par semaine pendant les vacances.
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            D'accord
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
