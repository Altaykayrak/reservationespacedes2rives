
import { Badge } from "@/components/ui/badge";
import { getSpotsBadgeVariant } from "@/utils/wednesdayUtils";

interface WednesdaySpotsBadgeProps {
  available: number;
  total: number;
  label: string;
}

export const WednesdaySpotsBadge = ({ available, total, label }: WednesdaySpotsBadgeProps) => {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-600 mb-0.5">{label}</div>
      <Badge variant={getSpotsBadgeVariant(available, total)} className="text-xs px-1 py-0.5">
        {available}/{total}
      </Badge>
    </div>
  );
};
