
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";

interface EditReservationDialogProps {
  reservation: WednesdayReservationWithChild | HolidayReservationWithChild | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  isSubmitting: boolean;
  withoutMeal: boolean;
  earlyDropoff: boolean;
  onWithoutMealChange: (checked: boolean) => void;
  onEarlyDropoffChange: (checked: boolean) => void;
}

export const EditReservationDialog = ({
  reservation,
  isOpen,
  onClose,
  onUpdate,
  isSubmitting,
  withoutMeal,
  earlyDropoff,
  onWithoutMealChange,
  onEarlyDropoffChange,
}: EditReservationDialogProps) => {
  if (!reservation) return null;

  const childName = `${reservation.children?.first_name} ${reservation.children?.last_name}`;
  const reservationDate = 'wednesday_id' in reservation 
    ? new Date(reservation.available_wednesdays.date).toLocaleDateString('fr-FR')
    : new Date(reservation.reservation_date).toLocaleDateString('fr-FR');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la réservation</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <p className="font-medium">{childName}</p>
            <p className="text-sm text-gray-500">Date: {reservationDate}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="without-meal">Sans repas</Label>
              <p className="text-sm text-gray-500">
                L'enfant ne mangera pas sur place
              </p>
            </div>
            <Switch
              id="without-meal"
              checked={withoutMeal}
              onCheckedChange={onWithoutMealChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="early-dropoff">Garderie du matin</Label>
              <p className="text-sm text-gray-500">
                L'enfant arrive plus tôt le matin
              </p>
            </div>
            <Switch
              id="early-dropoff"
              checked={earlyDropoff}
              onCheckedChange={onEarlyDropoffChange}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={onUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Modification..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
