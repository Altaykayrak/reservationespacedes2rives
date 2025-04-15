
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [maxParticipantsKindergarten, setMaxParticipantsKindergarten] = useState("");
  const [maxParticipantsPrimary, setMaxParticipantsPrimary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Effect to update form when wednesdayToEdit changes
  useEffect(() => {
    if (wednesdayToEdit) {
      console.log("Editing Wednesday:", wednesdayToEdit);
      setSelectedDate(new Date(wednesdayToEdit.date));
      setMaxParticipantsKindergarten(wednesdayToEdit.max_participants_kindergarten.toString());
      setMaxParticipantsPrimary(wednesdayToEdit.max_participants_primary.toString());
    } else {
      // Reset form when not editing
      setSelectedDate(undefined);
      setMaxParticipantsKindergarten("");
      setMaxParticipantsPrimary("");
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
      setIsSubmitting(true);
      // Format the date as YYYY-MM-DD to ensure it works correctly
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      console.log("Submitting Wednesday with date:", formattedDate);
      console.log("Max participants kindergarten:", maxParticipantsKindergarten);
      console.log("Max participants primary:", maxParticipantsPrimary);

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

        if (error) {
          console.error("Error updating Wednesday:", error);
          throw error;
        }

        toast({
          title: "Succès",
          description: "Le mercredi a été modifié avec succès",
        });
      } else {
        // Insert new wednesday
        const { error, data } = await supabase
          .from("available_wednesdays")
          .insert({
            date: formattedDate,
            max_participants_kindergarten: parseInt(maxParticipantsKindergarten),
            max_participants_primary: parseInt(maxParticipantsPrimary),
          })
          .select();

        if (error) {
          console.error("Error adding Wednesday:", error);
          throw error;
        }

        console.log("Successfully added Wednesday:", data);
        toast({
          title: "Succès",
          description: "Le mercredi a été ajouté avec succès",
        });
      }

      // Reset form and notify parent component
      onSuccess();
      setSelectedDate(undefined);
      setMaxParticipantsKindergarten("");
      setMaxParticipantsPrimary("");
    } catch (error: any) {
      console.error("Error in handleAddWednesday:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            disabled={(date) => {
              // Only allow selecting Wednesdays
              return date.getDay() !== 3;
            }}
          />
          {selectedDate && (
            <p className="text-sm text-muted-foreground mt-2">
              Date sélectionnée: {format(selectedDate, 'dd/MM/yyyy')} ({format(selectedDate, 'EEEE', { locale: fr })})
            </p>
          )}
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

        <Button 
          onClick={handleAddWednesday} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              {wednesdayToEdit ? "Modification..." : "Ajout..."}
            </>
          ) : (
            wednesdayToEdit ? "Modifier" : "Ajouter"
          )}
        </Button>
      </div>
    </Card>
  );
};
