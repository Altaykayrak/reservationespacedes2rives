
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useReservationQueries } from "./useReservationQueries";
import { useReservationMutations } from "./useReservationMutations";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useReservations = () => {
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    children,
    reservations,
    refetchReservations,
    userProfile,
    isDateReservedForChild,
  } = useReservationQueries();
  
  const { createReservationMutation } = useReservationMutations(
    () => {
      setSelectedDates([]);
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    }
  );

  const handleDateToggle = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingIndex = selectedDates.findIndex(
      d => format(d.date, 'yyyy-MM-dd') === dateStr
    );

    if (existingIndex >= 0) {
      setSelectedDates(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      setSelectedDates(prev => [...prev, {
        date,
        withoutMeal: false,
        earlyDropoff: false
      }]);
    }
  };

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', checked: boolean) => {
    console.log('Changing option:', option, 'to:', checked, 'for date:', date);
    setSelectedDates(prev => prev.map(d => {
      if (format(d.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) {
        return { ...d, [option]: checked };
      }
      return d;
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

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

    const hasConflicts = selectedDates.some(dateOption => 
      isDateReservedForChild(selectedChild, dateOption.date)
    );

    if (hasConflicts) {
      toast({
        title: "Erreur",
        description: "Certaines dates sélectionnées sont déjà réservées pour cet enfant.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      for (const dateOption of selectedDates) {
        try {
          await createReservationMutation.mutateAsync({
            childId: selectedChild,
            date: dateOption.date,
            withoutMeal: dateOption.withoutMeal,
            earlyDropoff: dateOption.earlyDropoff,
          });
        } catch (error: any) {
          console.error("Error creating reservation:", error);
          
          // Handle policy violation error
          if (error?.message?.includes('policy')) {
            toast({
              title: "Places complètes",
              description: `Plus de places disponibles pour le ${format(dateOption.date, 'dd/MM/yyyy')}`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erreur",
              description: "Une erreur est survenue lors de la création de la réservation.",
              variant: "destructive",
            });
          }
          return; // Stop processing further dates if there's an error
        }
      }

      toast({
        title: "Succès",
        description: "Les réservations ont été créées avec succès.",
      });

      setSelectedDates([]);
      // Invalider le cache pour forcer une mise à jour
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["available_wednesdays"] });
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création des réservations.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedDates,
    setSelectedDates,
    selectedChild,
    setSelectedChild,
    children,
    reservations,
    handleSubmit,
    handleDateToggle,
    handleOptionChange,
    isSubmitting,
    isDateReservedForChild,
  };
};
