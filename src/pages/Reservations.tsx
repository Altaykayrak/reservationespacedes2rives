import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReservationCalendar } from "@/components/reservations/ReservationCalendar";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { Tables } from "@/integrations/supabase/types";

const Reservations = () => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const { toast } = useToast();

  // Fetch user's children
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

  // Fetch user's email
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      return user;
    },
  });

  // Helper function to generate a reservation number
  const generateReservationNumber = () => {
    return `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Send confirmation email
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

  // Mutation for creating reservations
  const createReservationMutation = useMutation({
    mutationFn: async (reservationData: {
      childId: string;
      date: Date;
      withoutMeal: boolean;
      earlyDropoff: boolean;
    }) => {
      const reservationNumber = generateReservationNumber();
      const { data, error } = await supabase
        .from("reservations")
        .insert({
          child_id: reservationData.childId,
          reservation_date: format(reservationData.date, "yyyy-MM-dd"),
          without_meal: reservationData.withoutMeal,
          early_dropoff: reservationData.earlyDropoff,
          reservation_number: reservationNumber,
        });

      if (error) throw error;

      // Get child name for email
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
      // Reset form
      setSelectedDates([]);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation.",
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Réservations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ReservationCalendar
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
        />
        <ReservationForm
          selectedDates={selectedDates}
          children={children}
          selectedChild={selectedChild}
          setSelectedChild={setSelectedChild}
          onSubmit={handleSubmit}
          isSubmitting={createReservationMutation.isPending}
        />
      </div>
    </div>
  );
};

export default Reservations;
