
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, Utensils } from "lucide-react";

interface AdminQuickActionsProps {
  selectedChild: string;
  onSelectAllDates: () => void;
  onSelectAllDatesWithoutMeal: () => void;
  onSelectAllDatesWithEarlyDropoff: () => void;
}

export const AdminQuickActions = ({
  selectedChild,
  onSelectAllDates,
  onSelectAllDatesWithoutMeal,
  onSelectAllDatesWithEarlyDropoff
}: AdminQuickActionsProps) => {
  if (!selectedChild) return null;

  return (
    <div className="space-y-2">
      <Button 
        type="button" 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2" 
        onClick={onSelectAllDates}
      >
        <CheckSquare className="h-4 w-4" />
        Sélectionner tous les mercredis
      </Button>
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2" 
        onClick={onSelectAllDatesWithoutMeal}
      >
        <Utensils className="h-4 w-4" />
        Tous sans repas
      </Button>

      <Button 
        type="button" 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2" 
        onClick={onSelectAllDatesWithEarlyDropoff}
      >
        <Clock className="h-4 w-4" />
        Tous avec un accueil avant 8h30
      </Button>
    </div>
  );
};
