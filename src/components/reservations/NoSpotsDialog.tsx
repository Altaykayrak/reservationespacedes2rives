
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
  date: Date | null;
}

export const NoSpotsDialog = ({
  open,
  onOpenChange,
  schoolClass,
  date
}: NoSpotsDialogProps) => {
  // Vérifier si la date est valide avant de tenter de la formater
  const isValidDate = date instanceof Date && !isNaN(date.getTime());
  
  // Préparer le message de date formatée seulement si la date est valide
  const formattedDateText = isValidDate && date 
    ? format(date, "d MMMM yyyy", { locale: fr })
    : "la date sélectionnée";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Plus de places disponibles</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Le groupe {getGroupName(schoolClass || '')} est complet pour {formattedDateText}.
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
