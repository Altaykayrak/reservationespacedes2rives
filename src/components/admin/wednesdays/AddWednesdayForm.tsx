
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fr } from "date-fns/locale";
import { format } from "date-fns";

interface Wednesday {
  id: string;
  date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
}

interface AddWednesdayFormProps {
  onSuccess: () => void;
  wednesdayToEdit: Wednesday | null;
}

export const AddWednesdayForm = ({ onSuccess, wednesdayToEdit }: AddWednesdayFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [maxParticipantsKindergarten, setMaxParticipantsKindergarten] = useState("");
  const [maxParticipantsPrimary, setMaxParticipantsPrimary] = useState("");
  const { toast } = useToast();

  // Effect to update form when wednesdayToEdit changes
  useEffect(() => {
    if (wednesdayToEdit) {
      setSelectedDate(new Date(wednesdayToEdit.date));
      setMaxParticipantsKindergarten(wednesdayToEdit.max_participants_kindergarten.toString());
      setMaxParticipantsPrimary(wednesdayToEdit.max_participants_primary.toString());
    }
  }, [wednesdayToEdit]);

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
      // Set admin username in session
      const adminSession = localStorage.getItem('adminUsername');
      if (!adminSession) {
        toast({
          title: "Erreur",
          description: "Session admin non trouvée",
          variant: "destructive",
        });
        return;
      }

      const { error: adminError } = await supabase.rpc('set_admin_username', {
        username: adminSession
      });

      if (adminError) throw adminError;

      // Format the date as YYYY-MM-DD to ensure it works correctly
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      console.log("Adding/updating Wednesday with date:", formattedDate);

      if (wednesdayToEdit) {
        // Update existing wednesday
        const { error } = await supabase
          .from("available_wednesdays")
          .update({
            date: formattedDate,
            max_participants_kindergarten: parseInt(maxParticipantsKindergarten),
            max_participants_primary: parseInt(maxParticipantsPrimary),
          })
          .eq("id", wednesdayToEdit.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Le mercredi a été modifié avec succès",
        });
      } else {
        // Insert new wednesday
        const { error } = await supabase.from("available_wednesdays").insert({
          date: formattedDate,
          max_participants_kindergarten: parseInt(maxParticipantsKindergarten),
          max_participants_primary: parseInt(maxParticipantsPrimary),
        });

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Le mercredi a été ajouté avec succès",
        });
      }

      onSuccess();
      setSelectedDate(undefined);
      setMaxParticipantsKindergarten("");
      setMaxParticipantsPrimary("");
    } catch (error: any) {
      console.error("Error adding/updating Wednesday:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        {wednesdayToEdit ? "Modifier un mercredi" : "Ajouter un mercredi"}
      </h2>
      
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
          {wednesdayToEdit ? "Modifier" : "Ajouter"}
        </Button>
      </div>
    </Card>
  );
};
