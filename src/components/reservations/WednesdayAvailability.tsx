
import { WednesdayWithCounts } from "@/hooks/useAvailableWednesdays";

interface WednesdayAvailabilityProps {
  wednesday: WednesdayWithCounts;
  isDisabled: boolean;
  isReserved: boolean;
}

export const WednesdayAvailability = ({ wednesday, isDisabled, isReserved }: WednesdayAvailabilityProps) => {
  if (isDisabled) {
    return (
      <span className="text-gray-600">
        {isReserved ? "(Déjà réservé)" : "Complet"}
      </span>
    );
  }

  return (
    <div className="space-y-0.5">
      <span className="block text-green-600">
        Maternelles : {wednesday.max_participants_kindergarten - wednesday.kindergartenReservations} places restantes 
        ({wednesday.kindergartenReservations}/{wednesday.max_participants_kindergarten})
      </span>
      <span className="block text-green-600">
        Primaires : {wednesday.max_participants_primary - wednesday.primaryReservations} places restantes
        ({wednesday.primaryReservations}/{wednesday.max_participants_primary})
      </span>
    </div>
  );
};
