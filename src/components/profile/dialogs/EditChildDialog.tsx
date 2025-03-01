
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AddChildForm } from "../AddChildForm"
import { Child } from "@/types/profile"

interface EditChildDialogProps {
  child: Child | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditChildDialog({ child, onOpenChange, onSuccess }: EditChildDialogProps) {
  return (
    <Dialog open={!!child} onOpenChange={() => onOpenChange(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'enfant</DialogTitle>
        </DialogHeader>
        {child && (
          <AddChildForm
            initialData={child}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
