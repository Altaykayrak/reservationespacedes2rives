import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useReservationQueries } from "./useReservationQueries";
import { useReservationMutations } from "./useReservationMutations";
import { useEmailNotification } from "./useEmailNotification";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useReservations = () => {
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const { toast } = useToast();

  const {
    children,
    reservations,
    refetchReservations,
    userProfile,
    isDateReservedForChild,
  } = useReservationQueries();

  const { sendConfirmationEmail } = useEmailNotification();
  
  const { createReservationMutation } = useReservationMutations(
    () => {
      setSelectedDates([]);
      refetchReservations();
    }
  );

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

    console.log("Selected dates before submission:", selectedDates);

    for (const dateOption of selectedDates) {
      await createReservationMutation.mutateAsync({
        childId: selectedChild,
        date: dateOption.date,
        withoutMeal: dateOption.withoutMeal,
        earlyDropoff: dateOption.earlyDropoff,
      });

      const selectedChildData = children?.find(child => child.id === selectedChild);
      if (selectedChildData) {
        await sendConfirmationEmail(
          `${selectedChildData.first_name} ${selectedChildData.last_name}`,
          dateOption.date,
          `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userProfile?.email
        );
      }
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
    isSubmitting: createReservationMutation.isPending,
    isDateReservedForChild,
  };
};