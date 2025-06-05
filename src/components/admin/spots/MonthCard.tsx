
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WednesdaySpots } from "@/hooks/useWednesdaySpots";
import { WednesdaySpotCard } from "./WednesdaySpotCard";

interface MonthCardProps {
  monthData: {
    monthName: string;
    wednesdays: WednesdaySpots[];
  };
  colorClass: string;
}

export const MonthCard = ({ monthData, colorClass }: MonthCardProps) => {
  return (
    <Card className={`${colorClass} border`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-gray-800 capitalize">
          {monthData.monthName}
        </CardTitle>
        <p className="text-xs text-gray-600">{monthData.wednesdays.length} mercredis disponibles</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {monthData.wednesdays.map((spot) => (
            <WednesdaySpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
