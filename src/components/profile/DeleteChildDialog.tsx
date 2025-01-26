import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Child } from "@/types/profile"

interface DeleteChildDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  child: Child | null
}

export function DeleteChildDialog({ open, onOpenChange, onConfirm, child }: DeleteChildDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer un enfant</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cet enfant ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}