import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Email {
  id: string;
  email: string;
  created_at: string;
}

interface EmailListProps {
  emails: Email[];
}

export const EmailList = ({ emails }: EmailListProps) => {
  const queryClient = useQueryClient();

  const deleteEmailMutation = useMutation({
    mutationFn: async (id: string) => {
      const adminUsername = localStorage.getItem('adminUsername');
      const { error } = await supabase
        .from("authorized_emails")
        .delete()
        .eq("id", id)
        .select('*', {
          headers: {
            'x-admin-username': adminUsername || ''
          }
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorizedEmails"] });
      toast.success("Email supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting email:", error);
      toast.error("Une erreur est survenue lors de la suppression de l'email");
    },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Date d'ajout</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {emails.length > 0 ? (
          emails.map((email) => (
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
  );
};