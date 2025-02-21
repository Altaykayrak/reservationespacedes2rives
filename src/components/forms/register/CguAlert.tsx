
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface CguAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CguAlert = ({ open, onOpenChange }: CguAlertProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Conditions générales d'utilisation</AlertDialogTitle>
          <AlertDialogDescription>
            Vous devez accepter les conditions générales d'utilisation pour
            continuer votre inscription.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            D'accord
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
