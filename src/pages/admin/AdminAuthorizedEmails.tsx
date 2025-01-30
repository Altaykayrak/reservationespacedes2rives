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

const AdminAuthorizedEmails = () => {
  const [newEmail, setNewEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Vérifie si l'utilisateur est un admin
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      // Vérifie si l'utilisateur est connecté en tant qu'admin via le localStorage
      const adminSession = localStorage.getItem('adminSession');
      return adminSession === 'true';
    },
  });

  // Fetch authorized emails
  const { data: authorizedEmails, isLoading, error: queryError } = useQuery({
    queryKey: ["authorizedEmails"],
    queryFn: async () => {
      try {
        console.log("Fetching authorized emails...");
        
        const { data, error } = await supabase
          .from("authorized_emails")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching emails:", error);
          throw error;
        }

        console.log("Fetched emails:", data);
        return data || [];
      } catch (error) {
        console.error("Error in queryFn:", error);
        throw error;
      }
    },
  });

  // Add new email
  const addEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Only admins can add emails");
      }
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
      console.error("Error adding email:", error);
      if (error.message === "Unauthorized: Only admins can add emails") {
        toast.error("Vous devez être administrateur pour ajouter des emails");
      } else if (error.code === "23505") {
        toast.error("Cet email est déjà autorisé");
      } else {
        toast.error("Une erreur est survenue lors de l'ajout de l'email");
      }
    },
  });

  // Delete email
  const deleteEmailMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Only admins can delete emails");
      }
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
    onError: (error) => {
      console.error("Error deleting email:", error);
      if (error.message === "Unauthorized: Only admins can delete emails") {
        toast.error("Vous devez être administrateur pour supprimer des emails");
      } else {
        toast.error("Une erreur est survenue lors de la suppression de l'email");
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

  // Filter emails based on search term
  const filteredEmails = authorizedEmails?.filter((email) =>
    email.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isCheckingAdmin) {
    return (
      <div>
        <AdminNavbar />
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Gestion des emails autorisés</h1>
          <div>Vérification des droits d'accès...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div>
        <AdminNavbar />
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Accès non autorisé</h1>
          <div>Vous devez être administrateur pour accéder à cette page.</div>
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div>
        <AdminNavbar />
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Gestion des emails autorisés</h1>
          <div className="text-red-500">
            Erreur lors du chargement des emails: {queryError.message}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <AdminNavbar />
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Gestion des emails autorisés</h1>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Date d'ajout</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmails && filteredEmails.length > 0 ? (
              filteredEmails.map((email) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Aucun email autorisé trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminAuthorizedEmails;
