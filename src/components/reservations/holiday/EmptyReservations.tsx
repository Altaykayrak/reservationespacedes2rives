
import { EmptyHolidayState } from "./EmptyHolidayState";

export const EmptyReservations = () => {
  return (
    <EmptyHolidayState 
      message="Aucune réservation trouvée"
      subtitle="Vous n'avez pas encore de réservations de vacances pour vos enfants."
    />
  );
};
