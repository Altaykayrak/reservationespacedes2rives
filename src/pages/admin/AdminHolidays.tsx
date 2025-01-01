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
import SchoolClassCategories from "@/components/admin/SchoolClassCategories";

const AdminHolidays = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [maxParticipantsKindergarten, setMaxParticipantsKindergarten] = useState("");
  const [maxParticipantsPrimary, setMaxParticipantsPrimary] = useState("");
  const [maxParticipantsTeen, setMaxParticipantsTeen] = useState("");
  const { toast } = useToast();

  const { data: holidays, refetch } = useQuery({
    queryKey: ["available_holiday_periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

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
      const { error } = await supabase.from("available_holiday_periods").insert({
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        max_participants_kindergarten: parseInt(maxParticipantsKindergarten),
        max_participants_primary: parseInt(maxParticipantsPrimary),
        max_participants_teen: parseInt(maxParticipantsTeen),
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La période de vacances a été ajoutée avec succès",
      });

      refetch();
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
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des vacances</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        <SchoolClassCategories />

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Périodes de vacances disponibles</h2>
          
          <div className="space-y-4">
            {holidays?.map((holiday) => (
              <div
                key={holiday.id}
                className="flex items-center justify-between p-4 border rounded"
              >
                <div>
                  <p className="font-medium">
                    Du {new Date(holiday.start_date).toLocaleDateString("fr-FR")} au{" "}
                    {new Date(holiday.end_date).toLocaleDateString("fr-FR")}
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Maternelle: {holiday.max_participants_kindergarten} participants</p>
                    <p>Primaire: {holiday.max_participants_primary} participants</p>
                    <p>Adolescent: {holiday.max_participants_teen} participants</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminHolidays;