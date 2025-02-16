
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
      const table = reservationToDelete.type === 'wednesday' ? 'wednesday_reservations' : 'holiday_reservations';

      // Vérifions d'abord si la réservation existe
      const { data: existingReservation, error: checkError } = await supabase
        .from(table)
        .select('*')
        .eq('id', reservationToDelete.id)
        .single();

      if (checkError) {
        console.error('Error checking reservation:', checkError);
        throw checkError;
      }

      if (!existingReservation) {
        console.error('Reservation not found:', reservationToDelete.id);
        throw new Error('Réservation non trouvée');
      }

      console.log('Found reservation to delete:', existingReservation);

      // Procédons à la suppression
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', reservationToDelete.id);

      if (deleteError) {
        console.error('Error deleting reservation:', deleteError);
        throw deleteError;
      }

      console.log('Successfully deleted reservation');
      toast.success("Réservation supprimée avec succès");
      await refetchReservations();
    } catch (error) {
      console.error('Error in delete process:', error);
      toast.error("Une erreur est survenue lors de la suppression de la réservation");
    } finally {
      setIsSubmitting(false);
      setReservationToDelete(null);
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
