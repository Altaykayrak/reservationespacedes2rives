
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Sélection minimum requise
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-700">
            Veuillez sélectionner au moins 1 jour pour valider votre réservation.
          </p>
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
