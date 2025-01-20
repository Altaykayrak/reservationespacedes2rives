import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { validateHolidayReservations } from "@/utils/dateUtils";

export const HolidayReservationContent = () => {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupération des périodes de vacances disponibles
  const { data: holidayPeriods } = useQuery({
    queryKey: ["holidayPeriods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*")
        .gte("end_date", new Date().toISOString().split("T")[0])
        .order("start_date");
      
      if (error) throw error;
      return data;
    },
  });

  // Récupération des enfants de l'utilisateur
  const { data: children } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const handleDateToggle = (date: Date) => {
    const isSelected = selectedDates.some(d => d.getTime() === date.getTime());
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => d.getTime() !== date.getTime()));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
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

    const selectedChildData = children?.find(child => child.id === selectedChild);
    if (!selectedChildData) {
      toast({
        title: "Erreur",
        description: "Impossible de trouver les informations de l'enfant.",
        variant: "destructive",
      });
      return;
    }

    // Trouver la période de vacances correspondante
    const holidayPeriod = holidayPeriods?.find(period => {
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);
      return selectedDates.some(date => 
        date >= startDate && date <= endDate
      );
    });

    if (!holidayPeriod) {
      toast({
        title: "Erreur",
        description: "Les dates sélectionnées doivent appartenir à une même période de vacances.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Validation des dates et du nombre de participants
      const validationResult = await validateHolidayReservations(
        selectedDates,
        holidayPeriod,
        selectedChildData.school_class,
        supabase
      );

      if (!validationResult.isValid) {
        toast({
          title: "Erreur de validation",
          description: validationResult.message,
          variant: "destructive",
        });
        return;
      }

      // Création d'une réservation pour chaque date
      for (const date of selectedDates) {
        const { error: reservationError } = await supabase
          .from("reservations")
          .insert({
            child_id: selectedChild,
            period_id: holidayPeriod.id,
            reservation_date: format(date, "yyyy-MM-dd"),
            reservation_number: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          });

        if (reservationError) throw reservationError;
      }

      toast({
        title: "Succès",
        description: "Les réservations ont été créées avec succès.",
      });

      // Réinitialisation du formulaire
      setSelectedDates([]);
      setSelectedChild("");

    } catch (error) {
      console.error("Erreur lors de la création des réservations:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création des réservations.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!holidayPeriods || holidayPeriods.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">
          Aucune période de vacances n'est disponible pour le moment.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="child-select">Sélectionner un enfant</Label>
            <select
              id="child-select"
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full mt-2 rounded-md border border-gray-300 p-2"
            >
              <option value="">Choisir un enfant</option>
              {children?.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.first_name} {child.last_name} ({child.school_class})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {holidayPeriods.map((period) => {
              const startDate = new Date(period.start_date);
              const endDate = new Date(period.end_date);
              const dates = [];
              const currentDate = new Date(startDate);

              while (currentDate <= endDate) {
                if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
                  dates.push(new Date(currentDate));
                }
                currentDate.setDate(currentDate.getDate() + 1);
              }

              return (
                <div key={period.id} className="border-2 border-blue-100 rounded-lg p-4 bg-blue-50/30">
                  <Label className="font-medium block mb-4">
                    {format(startDate, "d MMMM yyyy", { locale: fr })} au{" "}
                    {format(endDate, "d MMMM yyyy", { locale: fr })}
                  </Label>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {dates.map((date) => (
                        <div key={date.toISOString()} className="flex items-center space-x-2">
                          <Checkbox
                            id={date.toISOString()}
                            checked={selectedDates.some(d => d.getTime() === date.getTime())}
                            onCheckedChange={() => handleDateToggle(date)}
                          />
                          <Label htmlFor={date.toISOString()}>
                            {format(date, "EEEE d MMMM", { locale: fr })}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              );
            })}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Réservation en cours..." : "Confirmer la réservation"}
          </Button>
        </div>
      </Card>
    </div>
  );
};