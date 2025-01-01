import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";

interface Wednesday {
  id: string;
  date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
}

interface WednesdaysListProps {
  wednesdays: Wednesday[] | null;
  onDelete: () => void;
}

export const WednesdaysList = ({ wednesdays, onDelete }: WednesdaysListProps) => {
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
      
      <div className="space-y-4">
        {wednesdays?.map((wednesday) => (
          <div
            key={wednesday.id}
            className="flex items-center justify-between p-4 border rounded"
          >
            <div>
              <p className="font-medium">
                {new Date(wednesday.date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-600">
                Maternelle (MS/GS): {wednesday.max_participants_kindergarten} participants
              </p>
              <p className="text-sm text-gray-600">
                Primaire (CP à CM2): {wednesday.max_participants_primary} participants
              </p>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteWednesday(wednesday.id)}
              title="Supprimer ce mercredi"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};