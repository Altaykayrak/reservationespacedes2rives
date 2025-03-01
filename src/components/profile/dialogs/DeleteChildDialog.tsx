
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Child } from "@/types/profile"

interface DeleteChildDialogProps {
  child: Child | null
  onOpenChange: (child: Child | null) => void
  onDelete: () => void
  isDeleting: boolean
}

export function DeleteChildDialog({ 
  child, 
  onOpenChange, 
  onDelete, 
  isDeleting 
}: DeleteChildDialogProps) {
  return (
    <AlertDialog 
      open={!!child} 
      onOpenChange={(isOpen) => !isDeleting && onOpenChange(isOpen ? child : null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. L'enfant sera définitivement supprimé.
            {isDeleting && <p className="mt-2">Vérification des réservations en cours...</p>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
