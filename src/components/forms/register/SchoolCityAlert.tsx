
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface SchoolCityAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SchoolCityAlert = ({ open, onOpenChange }: SchoolCityAlertProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Commune de scolarisation</AlertDialogTitle>
          <AlertDialogDescription>
            Vous devez sélectionner une commune de scolarisation pour
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
