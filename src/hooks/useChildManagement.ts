
import { useState } from "react"
import { Child } from "@/types/profile"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

export function useChildManagement() {
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [deletingChild, setDeletingChild] = useState<Child | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const queryClient = useQueryClient()

  const handleEditClick = async (child: Child) => {
    setIsChecking(true);
    
    try {
      // Vérifier si l'enfant a des réservations
      const { data: wednesdayReservations, error: wednesdayError } = await supabase
        .from('wednesday_reservations')
        .select('id')
        .eq('child_id', child.id)
        .limit(1);

      if (wednesdayError) throw wednesdayError;

      const { data: holidayReservations, error: holidayError } = await supabase
        .from('holiday_reservations')
        .select('id')
        .eq('child_id', child.id)
        .limit(1);

      if (holidayError) throw holidayError;

      if (wednesdayReservations?.length > 0 || holidayReservations?.length > 0) {
        toast.error("Impossible de modifier un enfant qui a des réservations");
        return;
      }

      // Si pas de réservations, permettre la modification
      setEditingChild(child);
    } catch (error) {
      console.error('Error checking reservations:', error);
      toast.error("Erreur lors de la vérification des réservations");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSuccessfulEdit = () => {
    setEditingChild(null);
    // Invalider explicitement le cache pour forcer un re-fetch
    queryClient.invalidateQueries({ queryKey: ['children'] });
    toast.success("Enfant modifié avec succès");
  };

  const handleDeleteChild = async () => {
    if (!deletingChild) return;
    
    setIsDeleting(true);

    try {
      // Vérifier si l'enfant a des réservations
      const { data: wednesdayReservations, error: wednesdayError } = await supabase
        .from('wednesday_reservations')
        .select('id')
        .eq('child_id', deletingChild.id)
        .limit(1);

      if (wednesdayError) throw wednesdayError;

      const { data: holidayReservations, error: holidayError } = await supabase
        .from('holiday_reservations')
        .select('id')
        .eq('child_id', deletingChild.id)
        .limit(1);

      if (holidayError) throw holidayError;

      if (wednesdayReservations?.length > 0 || holidayReservations?.length > 0) {
        toast.error("Impossible de supprimer un enfant qui a des réservations");
        setDeletingChild(null);
        return;
      }

      // Supprimer l'enfant
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', deletingChild.id);

      if (error) throw error;

      // Invalider explicitement le cache pour forcer un re-fetch
      queryClient.invalidateQueries({ queryKey: ['children'] });
      toast.success("Enfant supprimé avec succès");
      setDeletingChild(null);
    } catch (error) {
      console.error('Error deleting child:', error);
      toast.error("Erreur lors de la suppression de l'enfant");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    editingChild,
    setEditingChild,
    deletingChild,
    setDeletingChild,
    isDeleting,
    isChecking,
    handleEditClick,
    handleSuccessfulEdit,
    handleDeleteChild
  };
}
