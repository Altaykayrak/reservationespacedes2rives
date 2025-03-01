
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Rdv, MOTIFS_OPTIONS } from "@/types/rdv";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ConfirmRdvDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRdv: Rdv | null;
  selectedMotifs: string[];
  handleMotifChange: (motif: string) => void;
  handleReservation: () => void;
  isLoading: boolean;
}

export const ConfirmRdvDialog = ({
  open,
  onOpenChange,
  selectedRdv,
  selectedMotifs,
  handleMotifChange,
  handleReservation,
  isLoading
}: ConfirmRdvDialogProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmer votre rendez-vous</DialogTitle>
          <DialogDescription>
            {selectedRdv && (
              <p className="my-2">
                {formatDate(selectedRdv.date)} de {formatTime(selectedRdv.heure_debut)} à {formatTime(selectedRdv.heure_fin)}
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h3 className="mb-2 font-medium">Sélectionnez le(s) motif(s) du rendez-vous :</h3>
          <div className="space-y-3 mt-4">
            {MOTIFS_OPTIONS.map((motif) => (
              <div key={motif} className="flex items-center space-x-2">
                <Checkbox 
                  id={`motif-${motif}`} 
                  checked={selectedMotifs.includes(motif)}
                  onCheckedChange={() => handleMotifChange(motif)}
                />
                <label htmlFor={`motif-${motif}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {motif}
                </label>
              </div>
            ))}
          </div>
          
          {selectedMotifs.length === 0 && (
            <p className="text-red-500 text-sm mt-2">
              Veuillez sélectionner au moins un motif
            </p>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleReservation} 
            disabled={selectedMotifs.length === 0 || isLoading}
          >
            {isLoading ? "Confirmation..." : "Confirmer la réservation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
