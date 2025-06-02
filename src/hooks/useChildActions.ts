
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Child } from "@/types/profile";

export const useChildActions = () => {
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [deletingChild, setDeletingChild] = useState<Child | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const deleteChildMutation = useMutation({
    mutationFn: async (childId: string) => {
      console.log("Attempting to delete child with ID:", childId);
      
      const { error } = await supabase
        .from("children")
        .delete()
        .eq("id", childId);

      if (error) {
        console.error("Delete error:", error);
        throw error;
      }
      
      console.log("Child deleted successfully");
    },
    onSuccess: () => {
      toast.success("Enfant supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin_all_children"] });
      setDeletingChild(null);
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de l'enfant");
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });

  const handleDelete = async () => {
    if (!deletingChild || isDeleting) return;
    
    console.log("Starting delete process for child:", deletingChild);
    setIsDeleting(true);
    deleteChildMutation.mutate(deletingChild.id);
  };

  const handleSuccessfulEdit = () => {
    console.log("Edit successful, refreshing data");
    setEditingChild(null);
    queryClient.invalidateQueries({ queryKey: ["admin_all_children"] });
    toast.success("Enfant modifié avec succès");
  };

  return {
    editingChild,
    setEditingChild,
    deletingChild,
    setDeletingChild,
    isDeleting,
    handleDelete,
    handleSuccessfulEdit
  };
};
