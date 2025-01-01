import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReservationCalendar } from "@/components/reservations/ReservationCalendar";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { Card } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

type ReservationWithChild = Tables<"reservations"> & {
  children: Tables<"children">;
};

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

const Reservations = () => {
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

  const createReservationMutation = useMutation({
    mutationFn: async (reservationData: {
      childId: string;
      date: Date;
      withoutMeal: boolean;
      earlyDropoff: boolean;
    }) => {
      // Vérifier si une réservation existe déjà pour cet enfant à cette date
      const { data: existingReservations } = await supabase
        .from("reservations")
        .select("*")
        .eq("child_id", reservationData.childId)
        .eq("reservation_date", format(reservationData.date, "yyyy-MM-dd"));

      if (existingReservations && existingReservations.length > 0) {
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
        });

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

  // Group reservations by child
  const reservationsByChild = reservations?.reduce((acc, reservation) => {
    const childId = reservation.child_id;
    if (!acc[childId]) {
      acc[childId] = {
        childName: `${reservation.children.first_name} ${reservation.children.last_name}`,
        schoolClass: reservation.children.school_class,
        reservations: [],
      };
    }
    acc[childId].reservations.push(reservation);
    return acc;
  }, {} as Record<string, { childName: string; schoolClass: string; reservations: ReservationWithChild[] }>);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Réservations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ReservationCalendar
          selectedDates={selectedDates.map(d => d.date)}
          setSelectedDates={dates => setSelectedDates(dates.map(date => ({
            date,
            withoutMeal: false,
            earlyDropoff: false,
          })))}
        />
        <ReservationForm
          selectedDates={selectedDates.map(d => d.date)}
          children={children}
          selectedChild={selectedChild}
          setSelectedChild={setSelectedChild}
          onSubmit={handleSubmit}
          isSubmitting={createReservationMutation.isPending}
        />
      </div>

      {/* Liste des réservations par enfant */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Réservations actuelles</h2>
        <div className="space-y-4">
          {reservationsByChild && Object.entries(reservationsByChild).map(([childId, data]) => (
            <Card key={childId} className="p-4">
              <h3 className="font-medium text-lg mb-2">
                {data.childName} ({data.schoolClass})
              </h3>
              <ul className="space-y-2">
                {data.reservations.map((reservation) => (
                  <li key={reservation.id} className="flex items-center gap-4">
                    <span>
                      {format(new Date(reservation.reservation_date), "EEEE d MMMM yyyy", { locale: fr })}
                    </span>
                    <div className="flex gap-2">
                      {reservation.without_meal && (
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Sans repas
                        </span>
                      )}
                      {reservation.early_dropoff && (
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                          Accueil avant 8h30
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reservations;