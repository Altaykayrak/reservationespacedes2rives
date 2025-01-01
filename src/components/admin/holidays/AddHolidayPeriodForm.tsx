import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fr } from "date-fns/locale";
import { format } from "date-fns";

const AddHolidayPeriodForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [maxParticipantsKindergarten, setMaxParticipantsKindergarten] = useState("");
  const [maxParticipantsPrimary, setMaxParticipantsPrimary] = useState("");
  const [maxParticipantsTeen, setMaxParticipantsTeen] = useState("");
  const { toast } = useToast();

  const handleAddHolidayPeriod = async () => {
    if (!startDate || !endDate || !maxParticipantsKindergarten || !maxParticipantsPrimary || !maxParticipantsTeen) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      // Format dates to YYYY-MM-DD to avoid timezone issues
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      const { error } = await supabase.from("available_holiday_periods").insert({
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        max_participants_kindergarten: parseInt(maxParticipantsKindergarten),
        max_participants_primary: parseInt(maxParticipantsPrimary),
        max_participants_teen: parseInt(maxParticipantsTeen),
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La période de vacances a été ajoutée avec succès",
      });

      onSuccess();
      setStartDate(undefined);
      setEndDate(undefined);
      setMaxParticipantsKindergarten("");
      setMaxParticipantsPrimary("");
      setMaxParticipantsTeen("");
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
      <h2 className="text-xl font-semibold mb-4">Ajouter une période de vacances</h2>
      
      <div className="space-y-4">
        <div>
          <Label>Date de début</Label>
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            locale={fr}
          />
        </div>

        <div>
          <Label>Date de fin</Label>
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={setEndDate}
            locale={fr}
          />
        </div>

        <div>
          <Label htmlFor="maxParticipantsKindergarten">Nombre maximum de participants (Maternelle)</Label>
          <Input
            id="maxParticipantsKindergarten"
            type="number"
            value={maxParticipantsKindergarten}
            onChange={(e) => setMaxParticipantsKindergarten(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="maxParticipantsPrimary">Nombre maximum de participants (Primaire)</Label>
          <Input
            id="maxParticipantsPrimary"
            type="number"
            value={maxParticipantsPrimary}
            onChange={(e) => setMaxParticipantsPrimary(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="maxParticipantsTeen">Nombre maximum de participants (Adolescent)</Label>
          <Input
            id="maxParticipantsTeen"
            type="number"
            value={maxParticipantsTeen}
            onChange={(e) => setMaxParticipantsTeen(e.target.value)}
          />
        </div>

        <Button onClick={handleAddHolidayPeriod} className="w-full">
          Ajouter
        </Button>
      </div>
    </Card>
  );
};

export default AddHolidayPeriodForm;