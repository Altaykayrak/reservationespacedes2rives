import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReservationWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReservationWarningDialog = ({
  open,
  onOpenChange,
}: ReservationWarningDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Dates déjà réservées</AlertDialogTitle>
          <AlertDialogDescription>
            Vous avez déjà réservé certaines de ces dates pour votre enfant.
            Veuillez sélectionner d'autres dates.
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