import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Pencil } from "lucide-react";

interface Wednesday {
  id: string;
  date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
}

interface WednesdaysListProps {
  wednesdays: Wednesday[] | null;
  onDelete: () => void;
  onEdit: (wednesday: Wednesday) => void;
}

export const WednesdaysList = ({ wednesdays, onDelete, onEdit }: WednesdaysListProps) => {
  const { toast } = useToast();

  const handleDeleteWednesday = async (id: string) => {
    try {
      const { error } = await supabase
        .from("available_wednesdays")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le mercredi a été supprimé avec succès",
      });

      onDelete();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Mercredis disponibles</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wednesdays?.map((wednesday) => (
          <div
            key={wednesday.id}
            className="flex flex-col p-4 border rounded bg-white shadow-sm hover:shadow-md transition-shadow relative group"
          >
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
                onClick={() => handleDeleteWednesday(wednesday.id)}
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
        ))}
      </div>
    </Card>
  );
};