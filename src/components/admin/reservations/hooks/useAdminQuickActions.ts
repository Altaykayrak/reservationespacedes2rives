
import { useToast } from "@/hooks/use-toast";
import { useAvailableWednesdays } from "@/hooks/useAvailableWednesdays";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

interface UseAdminQuickActionsProps {
  selectedChild: string;
  isKindergarten: boolean;
  isPrimary: boolean;
  isDateReservedForChild: (date: Date) => boolean;
  selectedDates: DateOption[];
  handleDateToggle: (date: Date) => void;
  handleOptionChange: (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => void;
}

export const useAdminQuickActions = ({
  selectedChild,
  isKindergarten,
  isPrimary,
  isDateReservedForChild,
  selectedDates,
  handleDateToggle,
  handleOptionChange
}: UseAdminQuickActionsProps) => {
  const { toast } = useToast();
  const { data: availableWednesdays = [] } = useAvailableWednesdays(
    Boolean(isKindergarten),
    Boolean(isPrimary),
    true // isAdminMode = true
  );

  const selectAllDates = async () => {
    if (!selectedChild || !availableWednesdays.length) return;

    try {
      const availableDates = [];
      const fullDates = [];

      for (const wednesday of availableWednesdays) {
        const date = new Date(wednesday.date);
        const isReserved = isDateReservedForChild(date);
        
        if (isReserved) continue;

        let spotsLeft = 0;
        if (isKindergarten) {
          spotsLeft = wednesday.max_participants_kindergarten - wednesday.kindergartenReservations;
        } else if (isPrimary) {
          spotsLeft = wednesday.max_participants_primary - wednesday.primaryReservations;
        }

        if (spotsLeft <= 0) {
          fullDates.push(date);
        } else {
          availableDates.push({
            date,
            withoutMeal: false,
            earlyDropoff: false
          });
        }
      }

      // Vider d'abord toutes les sélections
      selectedDates.forEach(dateOption => {
        handleDateToggle(dateOption.date);
      });

      // Sélectionner toutes les dates disponibles
      availableDates.forEach(dateOption => {
        handleDateToggle(dateOption.date);
      });

      if (fullDates.length > 0) {
        const fullDatesText = fullDates
          .map(date => date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          }))
          .join(', ');

        toast({
          title: "Mercredis complets",
          description: `Les mercredis suivants sont complets et n'ont pas été sélectionnés : ${fullDatesText}. Vous pouvez contacter l'accueil pour être mis en liste d'attente.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la sélection automatique:", error);
    }
  };

  const selectAllDatesWithoutMeal = async () => {
    if (!selectedChild || !availableWednesdays.length) return;

    try {
      const availableDates = [];
      const fullDates = [];

      for (const wednesday of availableWednesdays) {
        const date = new Date(wednesday.date);
        const isReserved = isDateReservedForChild(date);
        
        if (isReserved) continue;

        let spotsLeft = 0;
        if (isKindergarten) {
          spotsLeft = wednesday.max_participants_kindergarten - wednesday.kindergartenReservations;
        } else if (isPrimary) {
          spotsLeft = wednesday.max_participants_primary - wednesday.primaryReservations;
        }

        if (spotsLeft <= 0) {
          fullDates.push(date);
        } else {
          availableDates.push({
            date,
            withoutMeal: true,
            earlyDropoff: false
          });
        }
      }

      // Vider d'abord toutes les sélections
      selectedDates.forEach(dateOption => {
        handleDateToggle(dateOption.date);
      });

      // Sélectionner toutes les dates disponibles avec l'option "sans repas"
      availableDates.forEach(dateOption => {
        handleDateToggle(dateOption.date);
        // Utiliser setTimeout pour s'assurer que la date est sélectionnée avant de modifier l'option
        setTimeout(() => {
          handleOptionChange(dateOption.date, 'withoutMeal', true);
        }, 50);
      });

      if (fullDates.length > 0) {
        const fullDatesText = fullDates
          .map(date => date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          }))
          .join(', ');

        toast({
          title: "Mercredis complets",
          description: `Les mercredis suivants sont complets et n'ont pas été sélectionnés : ${fullDatesText}. Vous pouvez contacter l'accueil pour être mis en liste d'attente.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la sélection automatique:", error);
    }
  };

  const selectAllDatesWithEarlyDropoff = async () => {
    if (!selectedChild || !availableWednesdays.length) return;

    try {
      const availableDates = [];
      const fullDates = [];

      for (const wednesday of availableWednesdays) {
        const date = new Date(wednesday.date);
        const isReserved = isDateReservedForChild(date);
        
        if (isReserved) continue;

        let spotsLeft = 0;
        if (isKindergarten) {
          spotsLeft = wednesday.max_participants_kindergarten - wednesday.kindergartenReservations;
        } else if (isPrimary) {
          spotsLeft = wednesday.max_participants_primary - wednesday.primaryReservations;
        }

        if (spotsLeft <= 0) {
          fullDates.push(date);
        } else {
          availableDates.push({
            date,
            withoutMeal: false,
            earlyDropoff: true
          });
        }
      }

      // Vider d'abord toutes les sélections
      selectedDates.forEach(dateOption => {
        handleDateToggle(dateOption.date);
      });

      // Sélectionner toutes les dates disponibles avec l'option "accueil avant 8h30"
      availableDates.forEach(dateOption => {
        handleDateToggle(dateOption.date);
        // Utiliser setTimeout pour s'assurer que la date est sélectionnée avant de modifier l'option
        setTimeout(() => {
          handleOptionChange(dateOption.date, 'earlyDropoff', true);
        }, 50);
      });

      if (fullDates.length > 0) {
        const fullDatesText = fullDates
          .map(date => date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          }))
          .join(', ');

        toast({
          title: "Mercredis complets",
          description: `Les mercredis suivants sont complets et n'ont pas été sélectionnés : ${fullDatesText}. Vous pouvez contacter l'accueil pour être mis en liste d'attente.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la sélection automatique:", error);
    }
  };

  return {
    selectAllDates,
    selectAllDatesWithoutMeal,
    selectAllDatesWithEarlyDropoff
  };
};
