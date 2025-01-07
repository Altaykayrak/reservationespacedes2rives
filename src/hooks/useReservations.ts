import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Child = Tables<"children">;
type ReservationWithChild = Tables<"reservations"> & {
  children: Tables<"children">;
};

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useReservations = () => {
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const { toast } = useToast();

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

  const { data: reservations, refetch: refetchReservations } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          children (
            first_name,
            last_name,
            school_class
          )
        `)
        .order('reservation_date', { ascending: true });
      
      if (error) throw error;
      return data as ReservationWithChild[];
    },
  });

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      return user;
    },
  });

  const generateReservationNumber = () => {
    return `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const sendConfirmationEmail = async (childName: string, date: Date, reservationNumber: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-reservation-email", {
        body: {
          childName,
          reservationDate: format(date, "dd/MM/yyyy", { locale: fr }),
          reservationNumber,
          parentEmail: userProfile?.email,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      throw error;
    }
  };

  const isDateReservedForChild = (childId: string, date: Date) => {
    if (!reservations) return false;
    
    return reservations.some(
      (reservation) => 
        reservation.child_id === childId && 
        reservation.reservation_date === format(date, "yyyy-MM-dd")
    );
  };

  const createReservationMutation = useMutation({
    mutationFn: async (reservationData: {
      childId: string;
      date: Date;
      withoutMeal: boolean;
      earlyDropoff: boolean;
    }) => {
      console.log("Creating reservation with data:", reservationData); // Ajout d'un log pour déboguer

      if (isDateReservedForChild(reservationData.childId, reservationData.date)) {
        throw new Error("Une réservation existe déjà pour cet enfant à cette date");
      }

      const reservationNumber = generateReservationNumber();
      const { data, error } = await supabase
        .from("reservations")
        .insert({
          child_id: reservationData.childId,
          reservation_date: format(reservationData.date, "yyyy-MM-dd"),
          without_meal: reservationData.withoutMeal,
          early_dropoff: reservationData.earlyDropoff,
          reservation_number: reservationNumber,
        })
        .select()
        .single();

      if (error) throw error;

      const selectedChildData = children?.find(child => child.id === reservationData.childId);
      if (selectedChildData) {
        await sendConfirmationEmail(
          `${selectedChildData.first_name} ${selectedChildData.last_name}`,
          reservationData.date,
          reservationNumber
        );
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Réservation confirmée",
        description: "Votre réservation a été enregistrée avec succès. Un email de confirmation vous a été envoyé.",
      });
      setSelectedDates([]);
      refetchReservations();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la réservation.",
        variant: "destructive",
      });
    },
  });

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

    // Vérifier toutes les dates avant de procéder aux réservations
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

    // Create a reservation for each selected date
    for (const dateOption of selectedDates) {
      await createReservationMutation.mutateAsync({
        childId: selectedChild,
        date: dateOption.date,
        withoutMeal: dateOption.withoutMeal,
        earlyDropoff: dateOption.earlyDropoff,
      });
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
    isDateReservedForChild
  };
};