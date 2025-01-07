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
    <div className="flex items-center gap-3 p-3 transition-colors hover:bg-gray-50">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
        <CalendarDays className="h-4 w-4 text-blue-500" />
      </div>
      <div className="flex-1 space-y-0.5">
        <span className="text-sm font-medium text-gray-800">
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