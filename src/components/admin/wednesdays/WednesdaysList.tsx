import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { WednesdayCard } from "./WednesdayCard";

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

  // Trier les mercredis par date
  const sortedWednesdays = wednesdays?.slice().sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Mercredis disponibles</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedWednesdays?.map((wednesday) => (
          <WednesdayCard
            key={wednesday.id}
            wednesday={wednesday}
            onDelete={handleDeleteWednesday}
            onEdit={onEdit}
          />
        ))}
      </div>
    </Card>
  );
};