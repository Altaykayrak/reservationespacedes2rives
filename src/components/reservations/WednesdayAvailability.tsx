
import { WednesdayWithCounts } from "@/hooks/useAvailableWednesdays";

interface WednesdayAvailabilityProps {
  wednesday: WednesdayWithCounts;
  isDisabled: boolean;
  isReserved: boolean;
}

export const WednesdayAvailability = ({
  wednesday,
  isDisabled,
  isReserved
}: WednesdayAvailabilityProps) => {
  if (isDisabled) {
    return <span className="text-gray-600">
        {isReserved ? "(Déjà réservé)" : "Complet"}
      </span>;
  }
  return <div className="space-y-0.5">
      <span className="block text-red-400">
        Maternelles : {wednesday.max_participants_kindergarten - wednesday.kindergartenReservations} places restantes
      </span>
      <span className="block text-green-600">
        Primaires : {wednesday.max_participants_primary - wednesday.primaryReservations} places restantes
      </span>
    </div>;
};
