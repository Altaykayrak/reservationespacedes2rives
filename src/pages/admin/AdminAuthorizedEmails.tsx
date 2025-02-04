
import { useState } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddEmailForm } from "@/components/admin/authorized-emails/AddEmailForm";
import { EmailSearch } from "@/components/admin/authorized-emails/EmailSearch";
import { EmailList } from "@/components/admin/authorized-emails/EmailList";

const AdminAuthorizedEmails = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user is admin using RPC function
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;
      
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin', { user_id: session.user.id });

      if (adminError) {
        console.error("Error checking admin status:", adminError);
        return false;
      }

      return isAdmin;
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
          .select()
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
    enabled: Boolean(isAdmin), // Only fetch if user is admin
  });

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
        <AddEmailForm />
        <EmailSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <EmailList emails={filteredEmails || []} />
      </div>
    </div>
  );
};

export default AdminAuthorizedEmails;
