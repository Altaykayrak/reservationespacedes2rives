import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ReservationBadges } from "./ReservationBadges";
import { Tables } from "@/integrations/supabase/types";
import { CalendarDays } from "lucide-react";

type ReservationWithChild = Tables<"reservations"> & {
  children: Tables<"children">;
};

interface ReservationItemProps {
  reservation: ReservationWithChild;
}

export const ReservationItem = ({ reservation }: ReservationItemProps) => {
  return (
    <div className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
        <CalendarDays className="h-5 w-5 text-blue-500" />
      </div>
      <div className="flex-1 space-y-1">
        <span className="font-medium text-gray-800">
          {format(new Date(reservation.reservation_date), "EEEE d MMMM yyyy", { locale: fr })}
        </span>
        <ReservationBadges
          withoutMeal={reservation.without_meal || false}
          earlyDropoff={reservation.early_dropoff || false}
        />
      </div>
    </div>
  );
};