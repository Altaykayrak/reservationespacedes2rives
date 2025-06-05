
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { WednesdaySpots } from "@/hooks/useWednesdaySpots";
import { WednesdaySpotsBadge } from "./WednesdaySpotsBadge";

interface WednesdaySpotCardProps {
  spot: WednesdaySpots;
}

export const WednesdaySpotCard = ({ spot }: WednesdaySpotCardProps) => {
  const kindergartenAvailable = Math.max(0, spot.max_participants_kindergarten - spot.kindergarten_reserved);
  const primaryAvailable = Math.max(0, spot.max_participants_primary - spot.primary_reserved);
  
  return (
    <div className="bg-white p-2 rounded border shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="font-medium text-gray-800 text-xs">
          {format(new Date(spot.date), "EEEE dd MMMM yyyy", { locale: fr })}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          <WednesdaySpotsBadge
            available={kindergartenAvailable}
            total={spot.max_participants_kindergarten}
            label="Maternelle"
          />
          <WednesdaySpotsBadge
            available={primaryAvailable}
            total={spot.max_participants_primary}
            label="Primaire"
          />
        </div>
      </div>
    </div>
  );
};
