import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const AddEmailForm = () => {
  const [newEmail, setNewEmail] = useState("");
  const queryClient = useQueryClient();

  const addEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const adminUsername = localStorage.getItem('adminUsername');
      const { error } = await supabase
        .from("authorized_emails")
        .insert([{ email }])
        .select()
        .headers({
          'x-admin-username': adminUsername || ''
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorizedEmails"] });
      setNewEmail("");
      toast.success("Email ajouté avec succès");
    },
    onError: (error: any) => {
      console.error("Error adding email:", error);
      if (error.code === "23505") {
        toast.error("Cet email est déjà autorisé");
      } else if (error.code === "42501") {
        toast.error("Vous n'avez pas les droits pour ajouter des emails");
      } else {
        toast.error("Une erreur est survenue lors de l'ajout de l'email");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    addEmailMutation.mutate(newEmail);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
      <Input
        type="email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        placeholder="Ajouter une nouvelle adresse email"
        className="max-w-md"
      />
      <Button
        type="submit"
        disabled={addEmailMutation.isPending || !newEmail}
      >
        {addEmailMutation.isPending ? "Ajout..." : "Ajouter"}
      </Button>
    </form>
  );
};