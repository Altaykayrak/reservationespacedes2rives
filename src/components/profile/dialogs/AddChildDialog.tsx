
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AddChildForm } from "../AddChildForm"

interface AddChildDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddChildDialog({ isOpen, onOpenChange, onSuccess }: AddChildDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un enfant</DialogTitle>
        </DialogHeader>
        <AddChildForm onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  )
}
