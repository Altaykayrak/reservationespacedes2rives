
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileData } from "@/types/profile";
import { toast } from "sonner";

interface UserEmail {
  id: string;
  email: string;
}

export const useAdminProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [automaticPaymentFilter, setAutomaticPaymentFilter] = useState<"all" | boolean>("all");
  const [waitingFilter, setWaitingFilter] = useState<"all" | boolean>("all");
  const [closedFilter, setClosedFilter] = useState<"all" | boolean>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [automaticPaymentFilter, waitingFilter, closedFilter, searchQuery]);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);

    console.log("Fetching profiles...");

    try {
      // Verify admin status first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError("Aucune session utilisateur trouvée");
        setLoading(false);
        return;
      }

      console.log("Got session, checking admin status:", session.user.id);
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', { user_id: session.user.id });
      
      if (adminError) {
        console.error("Error checking admin status:", adminError);
        setError("Erreur lors de la vérification des droits administrateur");
        setLoading(false);
        return;
      }
      
      console.log("Admin check result:", isAdmin);
      
      if (!isAdmin) {
        console.error("User is not an admin");
        setError("Vous n'avez pas les droits d'administrateur");
        setLoading(false);
        return;
      }

      console.log("Admin check passed, fetching profiles directly");

      // Fetch profiles data first
      let profilesQuery = supabase
        .from("profiles")
        .select("*");

      if (searchQuery) {
        profilesQuery = profilesQuery.ilike("first_name", `%${searchQuery}%`);
      }

      profilesQuery = profilesQuery.order("created_at", { ascending: false });

      if (automaticPaymentFilter !== "all") {
        profilesQuery = profilesQuery.eq("automatic_payment", automaticPaymentFilter);
      }

      if (waitingFilter !== "all") {
        profilesQuery = profilesQuery.eq("is_waiting", waitingFilter);
      }

      if (closedFilter !== "all") {
        profilesQuery = profilesQuery.eq("is_closed", closedFilter);
      }

      const { data: profilesData, error: profilesError } = await profilesQuery;

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        setError(`Erreur lors de la récupération des profils: ${profilesError.message}`);
        setLoading(false);
        return;
      }

      console.log("Profiles fetched successfully:", profilesData?.length || 0, "profiles");

      // Now fetch emails from auth.users table using admin RPC function
      if (profilesData && profilesData.length > 0) {
        const userIds = profilesData.map(profile => profile.id);
        console.log("Fetching emails for user IDs:", userIds);
        
        // Correction: Ajouter le deuxième argument de type (ici void pour les paramètres de la fonction)
        const { data: emailsData, error: emailsError } = await supabase.rpc<UserEmail[], { user_ids: string[] }>(
          'get_user_emails', 
          { user_ids: userIds }
        );
        
        if (emailsError) {
          console.error("Error fetching emails:", emailsError);
          // Continue with profiles data but no emails
          const profilesWithDefaultEmails = profilesData.map(profile => ({
            ...profile,
            email: 'Email non disponible'
          }));
          setProfiles(profilesWithDefaultEmails);
        } else if (emailsData && Array.isArray(emailsData)) {
          console.log("Emails fetched successfully:", emailsData.length, "emails");
          // Combine profiles with emails
          const profilesWithEmails = profilesData.map(profile => {
            const userEmail = emailsData.find(item => item.id === profile.id);
            return {
              ...profile,
              email: userEmail ? userEmail.email : 'Email non disponible'
            };
          });
          setProfiles(profilesWithEmails);
        } else {
          // If no emails data, just use profiles with a default email
          const profilesWithDefaultEmails = profilesData.map(profile => ({
            ...profile,
            email: 'Email non disponible'
          }));
          setProfiles(profilesWithDefaultEmails);
        }
      } else {
        setProfiles([]);
      }
    } catch (error) {
      console.error("Exception in fetchProfiles:", error);
      if (error instanceof Error) {
        setError(error.message);
        toast.error(`Erreur: ${error.message}`);
      } else {
        setError("Une erreur inconnue est survenue");
        toast.error("Une erreur inconnue est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAutomaticPaymentChange = async (id: string, automatic_payment: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ automatic_payment: !automatic_payment })
      .eq("id", id);

    if (error) {
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } else {
      fetchProfiles();
      toast.success("Profil mis à jour avec succès!");
    }
  };

  const handleWaitingChange = async (id: string, is_waiting: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_waiting: !is_waiting })
      .eq("id", id);

    if (error) {
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } else {
      fetchProfiles();
      toast.success("Profil mis à jour avec succès!");
    }
  };

  const handleClosedChange = async (id: string, is_closed: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_closed: !is_closed })
      .eq("id", id);

    if (error) {
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } else {
      fetchProfiles();
      toast.success("Profil mis à jour avec succès!");
    }
  };

  const handleBulkWaitingChange = async (value: boolean) => {
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_waiting: value })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all profiles

      if (error) {
        toast.error(`Erreur lors de la mise à jour des profils: ${error.message}`);
      } else {
        fetchProfiles();
        toast.success(`Tous les profils ont été mis ${value ? 'en attente' : 'hors attente'} avec succès!`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Erreur: ${error.message}`);
      }
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkClosedChange = async (value: boolean) => {
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_closed: value })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all profiles

      if (error) {
        toast.error(`Erreur lors de la mise à jour des profils: ${error.message}`);
      } else {
        fetchProfiles();
        toast.success(`Tous les profils ont été ${value ? 'fermés' : 'ouverts'} avec succès!`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Erreur: ${error.message}`);
      }
    } finally {
      setBulkActionLoading(false);
    }
  };

  return {
    profiles,
    loading,
    error,
    automaticPaymentFilter,
    setAutomaticPaymentFilter,
    waitingFilter,
    setWaitingFilter,
    closedFilter,
    setClosedFilter,
    searchQuery,
    setSearchQuery,
    bulkActionLoading,
    handleAutomaticPaymentChange,
    handleWaitingChange,
    handleClosedChange,
    handleBulkWaitingChange,
    handleBulkClosedChange,
  };
};
