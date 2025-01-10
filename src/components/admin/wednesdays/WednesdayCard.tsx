import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";

interface Wednesday {
  id: string;
  date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
}

interface WednesdayCardProps {
  wednesday: Wednesday;
  onDelete: (id: string) => void;
  onEdit: (wednesday: Wednesday) => void;
}

export const WednesdayCard = ({ wednesday, onDelete, onEdit }: WednesdayCardProps) => {
  return (
    <div className="flex flex-col p-4 border rounded bg-white shadow-sm hover:shadow-md transition-shadow relative group">
      <div className="absolute top-2 right-2 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onEdit(wednesday)}
          title="Modifier ce mercredi"
        >
          <Pencil className="h-3 w-3 text-blue-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onDelete(wednesday.id)}
          title="Supprimer ce mercredi"
        >
          <Trash2 className="h-3 w-3 text-red-500" />
        </Button>
      </div>
      
      <div className="flex-1">
        <p className="font-medium text-sm">
          {new Date(wednesday.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-600">
            Maternelle: {wednesday.max_participants_kindergarten}
          </p>
          <p className="text-xs text-gray-600">
            Primaire: {wednesday.max_participants_primary}
          </p>
        </div>
      </div>
    </div>
  );
};