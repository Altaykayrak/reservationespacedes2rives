
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rdv } from "@/types/rdv";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ReservationCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRdv: Rdv | null;
  selectedMotifs: string[];
  onClose: () => void;
}

export const ReservationCompleteDialog = ({
  open,
  onOpenChange,
  selectedRdv,
  selectedMotifs,
  onClose
}: ReservationCompleteDialogProps) => {
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
          <DialogTitle>Rendez-vous confirmé</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {selectedRdv && (
            <>
              <h3 className="font-medium">Détails du rendez-vous :</h3>
              <p className="mt-2">
                <strong>Date :</strong> {formatDate(selectedRdv.date)}
              </p>
              <p>
                <strong>Heure :</strong> {formatTime(selectedRdv.heure_debut)} - {formatTime(selectedRdv.heure_fin)}
              </p>
              <p>
                <strong>Lieu :</strong> Accueil Espace des 2 rives 4 place de la fraternité, 27590 Pîtres
              </p>
              <p>
                <strong>Motif(s) :</strong> {selectedMotifs.join(", ")}
              </p>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Documents à apporter :</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Justificatif de domicile</li>
                  <li>Carnet de santé (si nouveaux vaccins)</li>
                  <li>Quotient familial CAF ou avis d'imposition N-2</li>
                  <li>Un moyen de règlement (chèque, carte de paiement, RIB si vous souhaitez mettre en place le prélèvement automatique)</li>
                </ul>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
