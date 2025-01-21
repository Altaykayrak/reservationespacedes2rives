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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { validateHolidayReservations } from "@/utils/dateUtils";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const HolidayReservationContent = () => {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

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

  // Récupération des réservations existantes
  const { data: existingReservations } = useQuery({
    queryKey: ["reservations", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return [];
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("child_id", selectedChild);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedChild,
  });

  const handleDateToggle = (date: Date) => {
    const existingDate = selectedDates.find(d => d.date.getTime() === date.getTime());
    if (existingDate) {
      setSelectedDates(selectedDates.filter(d => d.date.getTime() !== date.getTime()));
    } else {
      setSelectedDates([...selectedDates, { date, withoutMeal: false, earlyDropoff: false }]);
    }
  };

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    setSelectedDates(selectedDates.map(d => 
      d.date.getTime() === date.getTime() 
        ? { ...d, [option]: value }
        : d
    ));
  };

  const isDateAlreadyReserved = (date: Date) => {
    if (!existingReservations) return false;
    return existingReservations.some(reservation => {
      const reservationDate = new Date(reservation.reservation_date);
      return reservationDate.getTime() === date.getTime();
    });
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

    // Vérification des dates déjà réservées
    const alreadyReservedDates = selectedDates.filter(dateOption => 
      isDateAlreadyReserved(dateOption.date)
    );

    if (alreadyReservedDates.length > 0) {
      const datesList = alreadyReservedDates
        .map(d => format(d.date, "d MMMM yyyy", { locale: fr }))
        .join(", ");
      
      toast({
        title: "Dates déjà réservées",
        description: `Les dates suivantes sont déjà réservées pour cet enfant : ${datesList}`,
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

    if (!holidayPeriods) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les périodes de vacances.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Validation des dates et du nombre de participants
      const validationResult = await validateHolidayReservations(
        selectedDates.map(d => d.date),
        holidayPeriods,
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
      for (const dateOption of selectedDates) {
        const period = holidayPeriods.find(period => {
          const startDate = new Date(period.start_date);
          const endDate = new Date(period.end_date);
          return dateOption.date >= startDate && dateOption.date <= endDate;
        });

        if (!period) {
          throw new Error(`Période non trouvée pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);
        }

        const { error: reservationError } = await supabase
          .from("reservations")
          .insert({
            child_id: selectedChild,
            period_id: period.id,
            reservation_date: format(dateOption.date, "yyyy-MM-dd"),
            without_meal: dateOption.withoutMeal,
            early_dropoff: dateOption.earlyDropoff,
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
      setSelectedPeriod("");

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

          <div>
            <Label htmlFor="period-select">Sélectionner une période</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Choisir une période" />
              </SelectTrigger>
              <SelectContent>
                {holidayPeriods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {format(new Date(period.start_date), "d MMMM yyyy", { locale: fr })} au{" "}
                    {format(new Date(period.end_date), "d MMMM yyyy", { locale: fr })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPeriod && (
            <div className="border-2 border-blue-100 rounded-lg p-4 bg-blue-50/30">
              {(() => {
                const period = holidayPeriods.find(p => p.id === selectedPeriod);
                if (!period) return null;

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
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {dates.map((date) => {
                        const selectedDate = selectedDates.find(d => d.date.getTime() === date.getTime());
                        return (
                          <div key={date.toISOString()} className="space-y-2 border-b pb-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={date.toISOString()}
                                checked={!!selectedDate}
                                onCheckedChange={() => handleDateToggle(date)}
                              />
                              <Label htmlFor={date.toISOString()}>
                                {format(date, "EEEE d MMMM", { locale: fr })}
                              </Label>
                            </div>
                            {selectedDate && (
                              <div className="ml-6 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`without-meal-${date.toISOString()}`}
                                    checked={selectedDate.withoutMeal}
                                    onCheckedChange={(checked) =>
                                      handleOptionChange(date, 'withoutMeal', checked as boolean)
                                    }
                                  />
                                  <Label htmlFor={`without-meal-${date.toISOString()}`}>
                                    Sans repas
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`early-dropoff-${date.toISOString()}`}
                                    checked={selectedDate.earlyDropoff}
                                    onCheckedChange={(checked) =>
                                      handleOptionChange(date, 'earlyDropoff', checked as boolean)
                                    }
                                  />
                                  <Label htmlFor={`early-dropoff-${date.toISOString()}`}>
                                    Accueil avant 8h30
                                  </Label>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                );
              })()}
            </div>
          )}

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
