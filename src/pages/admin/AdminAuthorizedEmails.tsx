import { useState } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const AdminAuthorizedEmails = () => {
  const [newEmail, setNewEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Fetch authorized emails
  const { data: authorizedEmails, isLoading } = useQuery({
    queryKey: ["authorizedEmails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("authorized_emails")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Add new email
  const addEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from("authorized_emails")
        .insert([{ email }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorizedEmails"] });
      setNewEmail("");
      toast.success("Email ajouté avec succès");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("Cet email est déjà autorisé");
      } else {
        toast.error("Une erreur est survenue lors de l'ajout de l'email");
      }
    },
  });

  // Delete email
  const deleteEmailMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("authorized_emails")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorizedEmails"] });
      toast.success("Email supprimé avec succès");
    },
    onError: () => {
      toast.error("Une erreur est survenue lors de la suppression de l'email");
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

  // Filter emails based on search term
  const filteredEmails = authorizedEmails?.filter((email) =>
    email.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Gestion des emails autorisés</h1>

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

        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Date d'ajout</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmails?.map((email) => (
                <TableRow key={email.id}>
                  <TableCell>{email.email}</TableCell>
                  <TableCell>
                    {new Date(email.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteEmailMutation.mutate(email.id)}
                      disabled={deleteEmailMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AdminAuthorizedEmails;