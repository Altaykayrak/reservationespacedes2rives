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
            Merci de sélectionner au minimum 3 jours par semaine
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