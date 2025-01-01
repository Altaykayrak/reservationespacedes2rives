import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, isWednesday, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

type ClosedPeriod = Tables<"closed_periods">;
type Child = Tables<"children">;

const Reservations = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [withoutMeal, setWithoutMeal] = useState(false);
  const [earlyDropoff, setEarlyDropoff] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const { toast } = useToast();

  // Fetch closed periods
  const { data: closedPeriods } = useQuery({
    queryKey: ["closedPeriods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("closed_periods")
        .select("*");
      
      if (error) throw error;
      return data as ClosedPeriod[];
    },
  });

  // Fetch user's children
  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*");
      
      if (error) throw error;
      return data as Child[];
    },
  });

  // Helper function to generate a reservation number
  const generateReservationNumber = () => {
    return `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Mutation for creating reservations
  const createReservationMutation = useMutation({
    mutationFn: async (reservationData: {
      childId: string;
      date: Date;
      withoutMeal: boolean;
      earlyDropoff: boolean;
    }) => {
      const { data, error } = await supabase
        .from("reservations")
        .insert({
          child_id: reservationData.childId,
          reservation_date: format(reservationData.date, "yyyy-MM-dd"),
          without_meal: reservationData.withoutMeal,
          early_dropoff: reservationData.earlyDropoff,
          reservation_number: generateReservationNumber(),
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Réservation confirmée",
        description: "Votre réservation a été enregistrée avec succès.",
      });
      // Reset form
      setSelectedDates([]);
      setWithoutMeal(false);
      setEarlyDropoff(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation.",
        variant: "destructive",
      });
    },
  });

  // Helper function to check if a date is within a closed period
  const isDateClosed = (date: Date) => {
    if (!closedPeriods) return false;
    return closedPeriods.some(period => {
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);
      return date >= startDate && date <= endDate;
    });
  };

  // Helper function to check if a date is during school holidays
  const isSchoolHoliday = (date: Date) => {
    const holidays = [
      { start: new Date(2024, 3, 6), end: new Date(2024, 3, 22) },
      { start: new Date(2024, 6, 6), end: new Date(2024, 7, 31) },
    ];

    return holidays.some(period => 
      date >= period.start && date <= period.end
    );
  };

  // Custom day rendering
  const renderDay = (day: Date) => {
    const isHoliday = isSchoolHoliday(day);
    const isClosed = isDateClosed(day);
    const isWed = isWednesday(day);

    return (
      <div
        className={`relative w-full h-full p-2 ${
          isClosed
            ? "bg-red-100"
            : isHoliday
            ? "bg-orange-100"
            : isWed
            ? "bg-blue-100"
            : ""
        }`}
      >
        <span className="absolute top-1 left-1">
          {format(day, "d")}
        </span>
      </div>
    );
  };

  const handleSubmit = async () => {
    if (!selectedChild) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un enfant.",
        variant: "destructive",
      });
      return;
    }

    if (selectedDates.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une date.",
        variant: "destructive",
      });
      return;
    }

    // Create a reservation for each selected date
    for (const date of selectedDates) {
      await createReservationMutation.mutateAsync({
        childId: selectedChild,
        date,
        withoutMeal,
        earlyDropoff,
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Réservations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={setSelectedDates}
            locale={fr}
            modifiersStyles={{
              selected: {
                backgroundColor: "rgb(59 130 246)",
                color: "white",
              },
            }}
            components={{
              Day: ({ date }) => renderDay(date),
            }}
          />

          <div className="mt-4 space-y-2">
            <h3 className="font-semibold">Légende :</h3>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100"></div>
              <span>Mercredi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100"></div>
              <span>Vacances scolaires</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100"></div>
              <span>Jours fermés</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Détails de la réservation</h2>
          {selectedDates.length > 0 ? (
            <div className="space-y-6">
              <div>
                <p className="font-medium mb-2">Dates sélectionnées :</p>
                <ul className="list-disc pl-5">
                  {selectedDates.map((date) => (
                    <li key={date.toISOString()}>
                      {format(date, "EEEE d MMMM yyyy", { locale: fr })}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="child-select">Sélectionner un enfant</Label>
                  <select
                    id="child-select"
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                    className="w-full mt-1 rounded-md border border-gray-300 p-2"
                  >
                    <option value="">Choisir un enfant</option>
                    {children?.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.first_name} {child.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="without-meal"
                      checked={withoutMeal}
                      onCheckedChange={(checked) => setWithoutMeal(checked as boolean)}
                    />
                    <Label htmlFor="without-meal">Sans repas</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="early-dropoff"
                      checked={earlyDropoff}
                      onCheckedChange={(checked) => setEarlyDropoff(checked as boolean)}
                    />
                    <Label htmlFor="early-dropoff">Accueil avant 8h30</Label>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={createReservationMutation.isPending}
                  className="w-full"
                >
                  {createReservationMutation.isPending ? "Réservation en cours..." : "Confirmer la réservation"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              Veuillez sélectionner une ou plusieurs dates dans le calendrier
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservations;