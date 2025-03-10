
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AddChildForm } from "../AddChildForm";
import { Child } from "@/types/profile";

interface EditChildDialogProps {
  child: Child | null;
  onOpenChange: (child: Child | null) => void;
  onSuccess: () => void;
}

export function EditChildDialog({ child, onOpenChange, onSuccess }: EditChildDialogProps) {
  return (
    <Dialog open={!!child} onOpenChange={(open) => !open && onOpenChange(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'enfant</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'enfant ci-dessous.
          </DialogDescription>
        </DialogHeader>
        {child && (
          <AddChildForm
            initialData={child}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
