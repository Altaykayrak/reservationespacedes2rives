
import { useState } from "react";
import { Child } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function useChildManagement() {
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [deletingChild, setDeletingChild] = useState<Child | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const queryClient = useQueryClient();

  const handleEditClick = async (child: Child) => {
    console.log("Starting edit check for child:", child);
    setIsChecking(true);
    
    try {
      // Check for wednesday reservations
      const { data: wednesdayReservations, error: wednesdayError } = await supabase
        .from('wednesday_reservations')
        .select('id')
        .eq('child_id', child.id)
        .limit(1);

      if (wednesdayError) {
        console.error('Error checking wednesday reservations:', wednesdayError);
        throw wednesdayError;
      }

      // Check for holiday reservations
      const { data: holidayReservations, error: holidayError } = await supabase
        .from('holiday_reservations')
        .select('id')
        .eq('child_id', child.id)
        .limit(1);

      if (holidayError) {
        console.error('Error checking holiday reservations:', holidayError);
        throw holidayError;
      }

      console.log('Wednesday reservations:', wednesdayReservations);
      console.log('Holiday reservations:', holidayReservations);

      // Block edit if child has reservations
      if ((wednesdayReservations && wednesdayReservations.length > 0) || 
          (holidayReservations && holidayReservations.length > 0)) {
        console.log("Child has reservations, blocking edit");
        toast.error("Impossible de modifier un enfant qui a des réservations");
        setIsChecking(false);
        return;
      }

      // Allow edit if no reservations
      console.log("Child has no reservations, allowing edit");
      setEditingChild(child);
    } catch (error) {
      console.error('Error checking reservations:', error);
      toast.error("Erreur lors de la vérification des réservations");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSuccessfulEdit = () => {
    console.log("Edit successful, closing dialog and refreshing data");
    setEditingChild(null);
    // Force a refetch by invalidating the cache
    queryClient.invalidateQueries({ queryKey: ['children'] });
    toast.success("Enfant modifié avec succès");
  };

  const handleDeleteChild = async () => {
    if (!deletingChild) {
      console.error("No child selected for deletion");
      return;
    }
    
    console.log("Starting deletion process for child:", deletingChild);
    setIsDeleting(true);

    try {
      // Check for wednesday reservations
      const { data: wednesdayReservations, error: wednesdayError } = await supabase
        .from('wednesday_reservations')
        .select('id')
        .eq('child_id', deletingChild.id)
        .limit(1);

      if (wednesdayError) {
        console.error('Error checking wednesday reservations:', wednesdayError);
        throw wednesdayError;
      }

      // Check for holiday reservations
      const { data: holidayReservations, error: holidayError } = await supabase
        .from('holiday_reservations')
        .select('id')
        .eq('child_id', deletingChild.id)
        .limit(1);

      if (holidayError) {
        console.error('Error checking holiday reservations:', holidayError);
        throw holidayError;
      }

      console.log('Wednesday reservations:', wednesdayReservations);
      console.log('Holiday reservations:', holidayReservations);

      // Block deletion if child has reservations
      if ((wednesdayReservations && wednesdayReservations.length > 0) || 
          (holidayReservations && holidayReservations.length > 0)) {
        console.log("Child has reservations, blocking deletion");
        toast.error("Impossible de supprimer un enfant qui a des réservations");
        setDeletingChild(null);
        setIsDeleting(false);
        return;
      }

      // Delete child if no reservations
      console.log("Proceeding with deletion for child:", deletingChild.id);
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', deletingChild.id);

      if (error) {
        console.error('Error deleting child:', error);
        throw error;
      }

      console.log("Child deleted successfully");
      // Force a refetch by invalidating the cache
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
