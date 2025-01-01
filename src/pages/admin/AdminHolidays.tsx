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
  const [maxParticipants, setMaxParticipants] = useState("");
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
    if (!startDate || !endDate || !maxParticipants) {
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
        max_participants: parseInt(maxParticipants),
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La période de vacances a été ajoutée avec succès",
      });

      refetch();
      setStartDate(undefined);
      setEndDate(undefined);
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
              <Label htmlFor="maxParticipants">Nombre maximum de participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
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
                  <p className="text-sm text-gray-600">
                    Max participants: {holiday.max_participants}
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

export default AdminHolidays;