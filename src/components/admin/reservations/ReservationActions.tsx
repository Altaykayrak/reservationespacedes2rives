
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";

interface ReservationActionsProps {
  refetchReservations: () => Promise<unknown>;
}

export const useReservationActions = ({ refetchReservations }: ReservationActionsProps) => {
  const [reservationToDelete, setReservationToDelete] = useState<{ id: string, type: 'wednesday' | 'holiday' } | null>(null);
  const [editingReservation, setEditingReservation] = useState<WednesdayReservationWithChild | HolidayReservationWithChild | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!reservationToDelete || isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log("Tentative de suppression de la réservation:", reservationToDelete);

      const table = reservationToDelete.type === 'wednesday' ? 'wednesday_reservations' : 'holiday_reservations';

      // Procéder directement à la suppression
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', reservationToDelete.id);

      if (deleteError) {
        console.error('Erreur lors de la suppression:', deleteError);
        throw deleteError;
      }

      console.log('Réservation supprimée avec succès');
      toast.success("Réservation supprimée avec succès");
      
      // S'assurer que l'état est réinitialisé avant de rafraîchir les données
      setReservationToDelete(null);
      await refetchReservations();
      
    } catch (error) {
      console.error('Erreur dans le processus de suppression:', error);
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression de la réservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingReservation || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const isWednesdayReservation = 'wednesday_id' in editingReservation;
      const table = isWednesdayReservation ? 'wednesday_reservations' : 'holiday_reservations';

      const { error } = await supabase
        .from(table)
        .update({
          without_meal: editingReservation.without_meal,
          early_dropoff: editingReservation.early_dropoff,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingReservation.id);

      if (error) throw error;

      toast.success("Réservation mise à jour avec succès");
      setEditingReservation(null);
      await refetchReservations();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
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
