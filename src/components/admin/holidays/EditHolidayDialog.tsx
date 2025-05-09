
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditHolidayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  maxParticipantsKindergarten: string;
  maxParticipantsPrimary: string;
  maxParticipantsTeen: string;
  setMaxParticipantsKindergarten: (value: string) => void;
  setMaxParticipantsPrimary: (value: string) => void;
  setMaxParticipantsTeen: (value: string) => void;
}

const EditHolidayDialog = ({
  isOpen,
  onClose,
  onSave,
  maxParticipantsKindergarten,
  maxParticipantsPrimary,
  maxParticipantsTeen,
  setMaxParticipantsKindergarten,
  setMaxParticipantsPrimary,
  setMaxParticipantsTeen,
}: EditHolidayDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le nombre de places</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="maxParticipantsKindergarten">
              Nombre maximum de participants (Maternelle)
            </Label>
            <Input
              id="maxParticipantsKindergarten"
              type="number"
              placeholder="24"
              value={maxParticipantsKindergarten}
              onChange={(e) => setMaxParticipantsKindergarten(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxParticipantsPrimary">
              Nombre maximum de participants (Primaire)
            </Label>
            <Input
              id="maxParticipantsPrimary"
              type="number"
              placeholder="38"
              value={maxParticipantsPrimary}
              onChange={(e) => setMaxParticipantsPrimary(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxParticipantsTeen">
              Nombre maximum de participants (Adolescent)
            </Label>
            <Input
              id="maxParticipantsTeen"
              type="number"
              value={maxParticipantsTeen}
              onChange={(e) => setMaxParticipantsTeen(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditHolidayDialog;
