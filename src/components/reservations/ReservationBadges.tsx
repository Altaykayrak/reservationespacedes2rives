import { X, Clock } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReservationBadgesProps {
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const ReservationBadges = ({ withoutMeal, earlyDropoff }: ReservationBadgesProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider>
        {withoutMeal && (
          <Tooltip>
            <TooltipTrigger>
              <div className="inline-flex items-center rounded-full bg-red-100 p-2 text-red-700">
                <X className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sans repas</p>
            </TooltipContent>
          </Tooltip>
        )}
        {earlyDropoff && (
          <Tooltip>
            <TooltipTrigger>
              <div className="inline-flex items-center rounded-full bg-blue-100 p-2 text-blue-700">
                <Clock className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Accueil avant 8h30</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};