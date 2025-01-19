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
import { useQuery } from "@tanstack/react-query";

const AddHolidayPeriodForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const currentYear = new Date().getFullYear() + 1; // 2025
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [maxParticipantsKindergarten, setMaxParticipantsKindergarten] = useState("");
  const [maxParticipantsPrimary, setMaxParticipantsPrimary] = useState("");
  const [maxParticipantsTeen, setMaxParticipantsTeen] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();

  // Fetch all school class categories
  const { data: schoolClasses } = useQuery({
    queryKey: ["school_class_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const handleAddHolidayPeriod = async () => {
    if (!startDate || !endDate || !maxParticipantsKindergarten || !maxParticipantsPrimary || !maxParticipantsTeen || !name) {
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
      const fullName = `${currentYear}-${name}`;

      // 1. Insert the holiday period
      const { data: holidayPeriod, error: holidayError } = await supabase
        .from("available_holiday_periods")
        .insert({
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          name: fullName,
          max_participants_kindergarten: parseInt(maxParticipantsKindergarten),
          max_participants_primary: parseInt(maxParticipantsPrimary),
          max_participants_teen: parseInt(maxParticipantsTeen),
        })
        .select()
        .single();

      if (holidayError) throw holidayError;

      // 2. Add allowed classes based on categories
      if (schoolClasses && holidayPeriod) {
        const allowedClassesData = schoolClasses.map(schoolClass => ({
          holiday_period_id: holidayPeriod.id,
          school_class: schoolClass.name,
        }));

        const { error: allowedClassesError } = await supabase
          .from("holiday_allowed_classes")
          .insert(allowedClassesData);

        if (allowedClassesError) throw allowedClassesError;
      }

      toast({
        title: "Succès",
        description: "La période de vacances a été ajoutée avec succès",
      });

      setStartDate(undefined);
      setEndDate(undefined);
      setMaxParticipantsKindergarten("");
      setMaxParticipantsPrimary("");
      setMaxParticipantsTeen("");
      setName("");
      onSuccess();
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
          <Label htmlFor="name">Nom de la période</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Exemple: vacances-hiver"
          />
          <p className="text-sm text-gray-500 mt-1">
            Le nom final sera: {currentYear}-{name}
          </p>
        </div>

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