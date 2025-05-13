
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { format, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { createHolidayReservations } from "@/utils/reservationCreationUtils";
import { sendHolidayReservationEmail } from "@/utils/emailUtils";
import { useHolidayReservations } from "./useHolidayReservations";
import { validateMinimumDays } from "@/utils/reservationValidationUtils";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useHolidayReservation = () => {
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noSpotsDialog, setNoSpotsDialog] = useState({ isOpen: false, schoolClass: '', date: new Date() });
  const [minimumDaysDialog, setMinimumDaysDialog] = useState({ isOpen: false });
  const { toast } = useToast();
  const { refetch: refetchReservations } = useHolidayReservations();
  
  const isTeenPage = window.location.pathname === "/teenholiday-reservations" || 
                      window.location.pathname === "/admin/reservations/new-teen-holiday" ||
                      window.location.pathname === "/admin/new-teenholiday-reservation";

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

  const { data: holidayPeriods } = useQuery({
    queryKey: ["available_holiday_periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: existingReservations } = useQuery({
    queryKey: ["existing_holiday_reservations", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return [];
      const { data, error } = await supabase
        .from("holiday_reservations")
        .select("*")
        .eq("child_id", selectedChild);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedChild,
  });

  const isDateAlreadyReserved = (date: Date): boolean => {
    if (!existingReservations) return false;
    return existingReservations.some(reservation => {
      const reservationDate = new Date(reservation.reservation_date);
      return (
        reservationDate.getFullYear() === date.getFullYear() &&
        reservationDate.getMonth() === date.getMonth() &&
        reservationDate.getDate() === date.getDate()
      );
    });
  };

  const handleDateToggle = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isSelected = selectedDates.some(d => d.date.toISOString().split('T')[0] === dateStr);

    if (isSelected) {
      setSelectedDates(prev => prev.filter(d => d.date.toISOString().split('T')[0] !== dateStr));
    } else {
      setSelectedDates(prev => [...prev, { date: new Date(date), withoutMeal: isTeenPage, earlyDropoff: false }]);
    }
    
    // Log pour débogage
    console.log(`Date ${dateStr} ${isSelected ? 'désélectionnée' : 'sélectionnée'}, nombre actuel: ${isSelected ? selectedDates.length - 1 : selectedDates.length + 1}`);
  };

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    setSelectedDates(prev => {
      return prev.map(d => {
        if (d.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]) {
          return { ...d, [option]: value };
        }
        return d;
      });
    });
  };

  const handleSubmit = async () => {
    if (!selectedChild || !selectedPeriod || selectedDates.length === 0) return;
    
    // Generate a timestamp to trace this specific submission
    const submissionTimestamp = Date.now();
    console.log(`DEBUG: handleSubmit called - timestamp: ${submissionTimestamp}`);
    console.log(`DEBUG: selectedDates.length = ${selectedDates.length}`);
    
    setIsSubmitting(true);
    
    try {
      // Détection de la route administrative
      const isAdminRoute = window.location.pathname.includes('/admin/');
      console.log("DEBUG: isAdminRoute détecté:", isAdminRoute, "pour pathname:", window.location.pathname);
      
      // Vérifier ici si les dates sélectionnées respectent la règle des 3 jours minimum
      const hasMinimumDays = validateMinimumDays(selectedDates, isAdminRoute);
      console.log(`DEBUG: Résultat validation minimum jours: ${hasMinimumDays}`);
      
      if (!hasMinimumDays) {
        console.log("DEBUG: Validation des jours minimum échouée, affichage du dialogue");
        setMinimumDaysDialog({ isOpen: true });
        setIsSubmitting(false);
        return;
      }
      
      // Create the reservations
      const result = await createHolidayReservations(
        selectedChild, 
        selectedDates, 
        holidayPeriods,
        submissionTimestamp
      );
      
      if (result.success) {
        setSelectedDates([]);
        
        // Send the confirmation email
        try {
          console.log(`DEBUG: Sending confirmation email - timestamp: ${submissionTimestamp}`);
          const childFullName = `${result.childData?.first_name} ${result.childData?.last_name}`;
          const childSchoolClass = result.childData?.school_class || "";
          
          const emailResult = await sendHolidayReservationEmail(
            childFullName,
            selectedDates,
            result.periodName || "",
            result.reservationNumber || "",
            result.periodId || "",
            submissionTimestamp,
            childSchoolClass
          );
          
          console.log(`DEBUG: Email result:`, emailResult, `- timestamp: ${submissionTimestamp}`);
        } catch (emailError) {
          console.error(`DEBUG: Error sending email: ${emailError} - timestamp: ${submissionTimestamp}`);
          // Don't fail the whole operation if just the email fails
        }
        
        await refetchReservations();
        setShowSuccessDialog(true);
      } else if (result.noSpots) {
        setNoSpotsDialog({
          isOpen: true,
          schoolClass: result.noSpots.schoolClass,
          date: result.noSpots.date,
        });
      } else {
        console.error(`DEBUG: Error creating reservations: ${result.error} - timestamp: ${submissionTimestamp}`);
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors de la création des réservations.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(`DEBUG: Unexpected error in handleSubmit: ${error.message} - timestamp: ${submissionTimestamp}`);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création des réservations.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to group dates by week
  const getDatesPerWeek = (dates: Date[]) => {
    const weeks: Record<string, Date[]> = {};
    
    dates.forEach(date => {
      // Get the week number (ISO week, starting on Monday)
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      
      weeks[weekKey].push(date);
    });
    
    return weeks;
  };

  return {
    selectedDates,
    selectedChild,
    selectedPeriod,
    setSelectedChild,
    setSelectedPeriod,
    children,
    holidayPeriods,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    isDateAlreadyReserved,
    setSelectedDates,
    showSuccessDialog,
    setShowSuccessDialog,
    isSubmitting,
    noSpotsDialog,
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog
  };
};
