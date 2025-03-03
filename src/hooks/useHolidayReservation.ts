
import { useState, useEffect } from "react";
import { useChildrenData } from "./useChildrenData";
import { useHolidayPeriods } from "./useHolidayPeriods";
import { useReservationSubmission } from "./useReservationSubmission";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useExistingHolidayReservations } from "./useExistingHolidayReservations";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useHolidayReservation = () => {
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { children } = useChildrenData();
  const { holidayPeriods } = useHolidayPeriods();
  const { existingReservations, isDateAlreadyReserved, refetchReservations } = useExistingHolidayReservations(selectedChild);

  const { data: childInfo } = useQuery({
    queryKey: ["child", selectedChild],
    queryFn: async () => {
      if (!selectedChild) {
        console.log("Pas d'enfant sélectionné");
        return null;
      }
      console.log("Récupération des informations de l'enfant:", selectedChild);
      const { data, error } = await supabase
        .from("children")
        .select("school_class")
        .eq("id", selectedChild)
        .single();
      
      if (error) {
        console.error("Erreur lors de la récupération des informations de l'enfant:", error);
        throw error;
      }
      console.log("Informations de l'enfant récupérées:", data);
      return data;
    },
    enabled: Boolean(selectedChild)
  });

  const { data: schoolClassCategories } = useQuery({
    queryKey: ["schoolClassCategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*")
        .eq("category", "adolescent");
      
      if (error) throw error;
      return data;
    },
  });

  const isTeenClass = childInfo?.school_class && schoolClassCategories?.some(
    category => category.name.toUpperCase() === childInfo.school_class.toUpperCase()
  );

  const resetForm = () => {
    setSelectedDates([]);
    setSelectedPeriod("");
  };

  const sendConfirmationEmail = async (selectedDates: DateOption[], childName: string, periodName: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        console.error("Utilisateur non connecté");
        return;
      }

      // Format dates for email
      const formattedDates = selectedDates.map(dateOpt => {
        const date = dateOpt.date;
        return date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      });

      console.log("Sending confirmation email with the following data:", {
        userId: user.id,
        reservationType: "holiday",
        reservationDetails: {
          childName,
          dates: formattedDates,
          period: periodName
        }
      });

      // Send email notification with explicit reservationType
      const response = await supabase.functions.invoke("send-reservation-email", {
        body: {
          userId: user.id,
          reservationType: "holiday",
          childName: childName,
          dates: formattedDates,
          period: periodName,
          withoutMeal: selectedDates.map(d => d.withoutMeal),
          earlyDropoff: selectedDates.map(d => d.earlyDropoff)
        }
      });

      if (response.error) {
        console.error("Erreur lors de l'envoi de l'email:", response.error);
      } else {
        console.log("Email de confirmation envoyé avec succès", response.data);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de confirmation:", error);
    }
  };

  const { 
    handleSubmit: submit, 
    noSpotsDialog, 
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog 
  } = useReservationSubmission(
    selectedChild,
    selectedDates,
    holidayPeriods,
    isDateAlreadyReserved,
    async () => {
      await refetchReservations();
      
      // Get child name and period name for the email
      const childRecord = children?.find(child => child.id === selectedChild);
      const periodRecord = holidayPeriods?.find(period => period.id === selectedPeriod);
      
      if (childRecord && periodRecord) {
        await sendConfirmationEmail(selectedDates, `${childRecord.first_name} ${childRecord.last_name}`, periodRecord.name);
      }
      
      setShowSuccessDialog(true);
      resetForm();
    },
    resetForm
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateToggle = (date: Date) => {
    const isTeenPage = window.location.pathname === "/teenholiday-reservations" ||
                      window.location.pathname === "/admin/reservations/new-teen-holiday" ||
                      window.location.pathname === "/admin/new-teenholiday-reservation";
    
    if (isTeenClass && isTeenPage) return;
    
    if (isDateAlreadyReserved(date)) {
      return;
    }
    
    const existingDate = selectedDates.find(d => d.date.getTime() === date.getTime());
    if (existingDate) {
      setSelectedDates(selectedDates.filter(d => d.date.getTime() !== date.getTime()));
    } else {
      setSelectedDates([...selectedDates, { 
        date, 
        withoutMeal: false, 
        earlyDropoff: false 
      }]);
    }
  };

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    setSelectedDates(selectedDates.map(d => 
      d.date.getTime() === date.getTime() 
        ? { ...d, [option]: value }
        : d
    ));
  };

  return {
    selectedDates,
    setSelectedDates,
    selectedChild,
    setSelectedChild,
    selectedPeriod,
    setSelectedPeriod,
    children,
    holidayPeriods,
    handleDateToggle,
    handleOptionChange,
    handleSubmit,
    isDateAlreadyReserved,
    isTeenClass,
    childInfo,
    showSuccessDialog,
    setShowSuccessDialog,
    isSubmitting,
    noSpotsDialog,
    setNoSpotsDialog,
    minimumDaysDialog,
    setMinimumDaysDialog
  };
};
