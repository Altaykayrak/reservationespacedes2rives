
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useWednesdayReservationSubmission = (
  selectedChild: string,
  selectedDates: DateOption[],
  isDateAlreadyReserved: (date: Date) => boolean,
  refetchReservations: () => Promise<any>,
  resetForm: () => void
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

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

    try {
      for (const dateOption of selectedDates) {
        const { data: wednesday, error: wednesdayError } = await supabase
          .from("available_wednesdays")
          .select("id")
          .eq("date", format(dateOption.date, "yyyy-MM-dd"))
          .maybeSingle();

        if (wednesdayError) throw wednesdayError;
        if (!wednesday) throw new Error(`Mercredi non trouvé pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);

        // Vérifier d'abord si une réservation existe déjà
        const { data: existingReservation } = await supabase
          .from("wednesday_reservations")
          .select("id")
          .eq("child_id", selectedChild)
          .eq("wednesday_id", wednesday.id)
          .maybeSingle();

        if (existingReservation) {
          console.log(`Réservation déjà existante pour la date ${format(dateOption.date, "dd/MM/yyyy")}`);
          continue; // Passer à la date suivante
        }

        const { error: reservationError } = await supabase
          .from("wednesday_reservations")
          .insert({
            child_id: selectedChild,
            wednesday_id: wednesday.id,
            without_meal: dateOption.withoutMeal,
            early_dropoff: dateOption.earlyDropoff,
            status: 'confirmed',
            reservation_number: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          });

        if (reservationError) throw reservationError;
      }

      // Forcer la mise à jour des données après les réservations
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["available_wednesdays"] }),
        refetchReservations()
      ]);

      setShowSuccessDialog(true);
      resetForm();

    } catch (error: any) {
      console.error("Erreur lors de la création des réservations:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création des réservations.",
        variant: "destructive",
      });
    }
  };

  const SuccessDialog = () => (
    <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réservation confirmée</DialogTitle>
          <DialogDescription>
            Votre réservation a été enregistrée avec succès. 
            Vous pouvez consulter ci-dessous l'ensemble de vos réservations pour vos enfants.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setShowSuccessDialog(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { handleSubmit, SuccessDialog };
};
