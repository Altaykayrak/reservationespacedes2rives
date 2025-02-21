
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getGroupName } from "@/utils/schoolClassUtils";

interface NoSpotsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolClass: string;
  date: Date;
}

export const NoSpotsDialog = ({
  open,
  onOpenChange,
  schoolClass,
  date
}: NoSpotsDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Plus de places disponibles</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Le groupe {getGroupName(schoolClass)} est complet pour le {format(date, "d MMMM yyyy", { locale: fr })}.
            </p>
            <p>
              Vous pouvez contacter l'accueil si vous souhaitez être en liste d'attente.
            </p>
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
