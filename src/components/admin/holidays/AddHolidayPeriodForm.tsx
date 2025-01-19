import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import HolidayDatePicker from "./form/HolidayDatePicker";
import HolidayNameInput from "./form/HolidayNameInput";
import ParticipantsInputs from "./form/ParticipantsInputs";

const AddHolidayPeriodForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const currentYear = new Date().getFullYear(); // 2025
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
        <HolidayNameInput
          name={name}
          currentYear={currentYear}
          setName={setName}
        />

        <HolidayDatePicker
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />

        <ParticipantsInputs
          maxParticipantsKindergarten={maxParticipantsKindergarten}
          maxParticipantsPrimary={maxParticipantsPrimary}
          maxParticipantsTeen={maxParticipantsTeen}
          setMaxParticipantsKindergarten={setMaxParticipantsKindergarten}
          setMaxParticipantsPrimary={setMaxParticipantsPrimary}
          setMaxParticipantsTeen={setMaxParticipantsTeen}
        />

        <Button onClick={handleAddHolidayPeriod} className="w-full">
          Ajouter
        </Button>
      </div>
    </Card>
  );
};

export default AddHolidayPeriodForm;