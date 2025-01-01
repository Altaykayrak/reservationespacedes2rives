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

const AdminWednesdays = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [maxParticipants, setMaxParticipants] = useState("");
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
    if (!selectedDate || !maxParticipants) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("available_wednesdays").insert({
        date: selectedDate.toISOString().split("T")[0],
        max_participants: parseInt(maxParticipants),
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le mercredi a été ajouté avec succès",
      });

      refetch();
      setSelectedDate(undefined);
      setMaxParticipants("");
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
              <Label htmlFor="maxParticipants">Nombre maximum de participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
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
                    Max participants: {wednesday.max_participants}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminWednesdays;