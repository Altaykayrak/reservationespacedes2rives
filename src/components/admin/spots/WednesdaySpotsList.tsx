
import { WednesdaySpots } from "@/hooks/useWednesdaySpots";
import { groupWednesdaysByMonth, sortMonths, monthColors } from "@/utils/wednesdayUtils";
import { MonthCard } from "./MonthCard";

interface WednesdaySpotsList {
  wednesdaySpots: WednesdaySpots[];
}

export const WednesdaySpotsList = ({ wednesdaySpots }: WednesdaySpotsList) => {
  const groupedWednesdays = groupWednesdaysByMonth(wednesdaySpots);

  if (Object.keys(groupedWednesdays).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Aucun mercredi disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortMonths(groupedWednesdays).map(([monthKey, monthData], index) => (
        <MonthCard
          key={monthKey}
          monthData={monthData}
          colorClass={monthColors[index % monthColors.length]}
        />
      ))}
    </div>
  );
};
