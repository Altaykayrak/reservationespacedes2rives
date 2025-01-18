import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MinimumDaysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MinimumDaysDialog = ({
  open,
  onOpenChange,
}: MinimumDaysDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Nombre de jours insuffisant</AlertDialogTitle>
          <AlertDialogDescription>
            Vous devez sélectionner au minimum 3 jours par semaine pendant les vacances pour pouvoir effectuer une réservation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            D'accord
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};