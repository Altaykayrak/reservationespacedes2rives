import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useReservationQueries } from "./useReservationQueries";
import { useReservationMutations } from "./useReservationMutations";
import { useEmailNotification } from "./useEmailNotification";
import { format } from "date-fns";

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

      toast({
        title: "Succès",
        description: "Les réservations ont été créées avec succès.",
      });

      setSelectedDates([]);
    } catch (error: any) {
      console.error("Error creating reservations:", error);
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