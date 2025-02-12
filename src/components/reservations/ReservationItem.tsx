
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { WednesdayReservationWithChild } from "@/types/reservations";
import { ReservationBadges } from "./ReservationBadges";

interface ReservationItemProps {
  reservation: WednesdayReservationWithChild;
  onUpdate: () => void;
}

export const ReservationItem = ({ 
  reservation,
  onUpdate
}: ReservationItemProps) => {
  // Vérifier que nous avons toutes les données nécessaires
  if (!reservation.available_wednesdays || !reservation.children) {
    console.error("Missing required data in reservation:", reservation);
    return <div>Données de réservation incomplètes</div>;
  }

  return (
    <div className="flex items-center justify-between p-3 transition-colors hover:bg-gray-50">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-800">
          {format(new Date(reservation.available_wednesdays.date), "EEEE d MMMM yyyy", { locale: fr })}
        </span>
        <div className="flex flex-wrap gap-2 mt-1">
          {reservation.without_meal && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
              Sans repas
            </span>
          )}
          {reservation.early_dropoff && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              Accueil avant 8h30
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
