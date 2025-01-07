import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ReservationBadges } from "./ReservationBadges";
import { Tables } from "@/integrations/supabase/types";

type ReservationWithChild = Tables<"reservations"> & {
  children: Tables<"children">;
};

interface ReservationItemProps {
  reservation: ReservationWithChild;
}

export const ReservationItem = ({ reservation }: ReservationItemProps) => {
  return (
    <div className="flex flex-col space-y-2 p-4 rounded-lg bg-secondary/50">
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {format(new Date(reservation.reservation_date), "EEEE d MMMM yyyy", { locale: fr })}
        </span>
      </div>
      <ReservationBadges
        withoutMeal={reservation.without_meal || false}
        earlyDropoff={reservation.early_dropoff || false}
      />
    </div>
  );
};