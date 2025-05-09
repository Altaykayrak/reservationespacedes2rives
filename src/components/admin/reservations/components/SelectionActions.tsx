
import { Button } from "@/components/ui/button";
import { CheckSquare, Trash2 } from "lucide-react";

interface SelectionActionsProps {
  selectedCount: number;
  reservationCount: number;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  isDeletingMultiple: boolean;
  activeReservations: any[] | null;
}

export const SelectionActions = ({
  selectedCount,
  reservationCount,
  onSelectAll,
  onDeleteSelected,
  isDeletingMultiple,
  activeReservations,
}: SelectionActionsProps) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex flex-wrap justify-between items-center gap-3">
      <p className="text-blue-800 font-medium">
        {reservationCount} réservation{reservationCount > 1 ? 's' : ''} affichée{reservationCount > 1 ? 's' : ''}
        {selectedCount > 0 && ` (${selectedCount} sélectionnée${selectedCount > 1 ? 's' : ''})`}
      </p>
      
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onSelectAll}
          disabled={!activeReservations || activeReservations.length === 0}
        >
          <CheckSquare className="h-4 w-4 mr-1" />
          {selectedCount === reservationCount && reservationCount > 0 
            ? "Désélectionner tout" 
            : "Sélectionner tout"}
        </Button>
        
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={onDeleteSelected}
          disabled={selectedCount === 0 || isDeletingMultiple}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Supprimer {selectedCount > 0 ? `(${selectedCount})` : ""}
        </Button>
      </div>
    </div>
  );
};
