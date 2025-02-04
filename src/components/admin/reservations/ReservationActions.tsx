
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReservationWithChild } from "./hooks/useAdminReservations";

interface ReservationActionsProps {
  refetchReservations: () => Promise<unknown>;
}

export const useReservationActions = ({ refetchReservations }: ReservationActionsProps) => {
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);
  const [editingReservation, setEditingReservation] = useState<ReservationWithChild | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!reservationToDelete) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationToDelete);

      if (error) throw error;

      toast.success("Réservation supprimée avec succès");
      await refetchReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error("Une erreur est survenue lors de la suppression de la réservation");
    } finally {
      setReservationToDelete(null);
    }
  };

  const handleUpdate = async () => {
    if (!editingReservation) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("reservations")
        .update({
          without_meal: editingReservation.without_meal,
          early_dropoff: editingReservation.early_dropoff,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingReservation.id);

      if (error) throw error;

      toast.success("Réservation mise à jour avec succès");
      await refetchReservations();
      setEditingReservation(null);
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error("Une erreur est survenue lors de la modification de la réservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    reservationToDelete,
    setReservationToDelete,
    editingReservation,
    setEditingReservation,
    isSubmitting,
    handleDelete,
    handleUpdate
  };
};
