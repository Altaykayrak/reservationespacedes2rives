import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { fr } from "date-fns/locale";
import { Trash2 } from "lucide-react";

const AdminWednesdays = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [maxParticipantsKindergarten, setMaxParticipantsKindergarten] = useState("");
  const [maxParticipantsPrimary, setMaxParticipantsPrimary] = useState("");
  const { toast } = useToast();

  const { data: wednesdays, refetch } = useQuery({
    queryKey: ["available_wednesdays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_wednesdays")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleAddWednesday = async () => {
    if (!selectedDate || !maxParticipantsKindergarten || !maxParticipantsPrimary) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a new date object and set it to midnight UTC
      const dateToInsert = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      ));

      const { error } = await supabase.from("available_wednesdays").insert({
        date: dateToInsert.toISOString().split("T")[0],
        max_participants_kindergarten: parseInt(maxParticipantsKindergarten),
        max_participants_primary: parseInt(maxParticipantsPrimary),
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le mercredi a été ajouté avec succès",
      });

      refetch();
      setSelectedDate(undefined);
      setMaxParticipantsKindergarten("");
      setMaxParticipantsPrimary("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

      refetch();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des mercredis</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Ajouter un mercredi</h2>
          
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={fr}
              />
            </div>

            <div>
              <Label htmlFor="maxParticipantsKindergarten">
                Nombre maximum de participants (Maternelle - MS/GS)
              </Label>
              <Input
                id="maxParticipantsKindergarten"
                type="number"
                value={maxParticipantsKindergarten}
                onChange={(e) => setMaxParticipantsKindergarten(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="maxParticipantsPrimary">
                Nombre maximum de participants (Primaire - CP à CM2)
              </Label>
              <Input
                id="maxParticipantsPrimary"
                type="number"
                value={maxParticipantsPrimary}
                onChange={(e) => setMaxParticipantsPrimary(e.target.value)}
              />
            </div>

            <Button onClick={handleAddWednesday} className="w-full">
              Ajouter
            </Button>
          </div>
        </Card>

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
      </div>
    </div>
  );
};

export default AdminWednesdays;