
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
      const { error } = await supabase
        .from("children")
        .delete()
        .eq("id", childId);

      if (error) throw error;
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
    
    setIsDeleting(true);
    deleteChildMutation.mutate(deletingChild.id);
  };

  const handleSuccessfulEdit = () => {
    setEditingChild(null);
    queryClient.invalidateQueries({ queryKey: ["admin_all_children"] });
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
