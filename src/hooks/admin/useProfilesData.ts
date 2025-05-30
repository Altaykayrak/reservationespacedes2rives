
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileData } from "@/types/profile";
import { toast } from "sonner";

interface UseProfilesDataProps {
  automaticPaymentFilter: "all" | boolean;
  waitingFilter: "all" | boolean;
  closedFilter: "all" | boolean;
  hasReservationsFilter: "all" | boolean;
  searchQuery: string;
}

export const useProfilesData = (filters: UseProfilesDataProps) => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    automaticPaymentFilter,
    waitingFilter,
    closedFilter,
    hasReservationsFilter,
    searchQuery
  } = filters;

  const fetchProfiles = useCallback(async () => {
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

      // Handle reservation filter case
      if (hasReservationsFilter !== "all") {
        const { data: profilesWithReservations, error: reservationsError } = await supabase
          .rpc('get_profiles_with_reservations', { has_reservations: hasReservationsFilter === true });

        if (reservationsError) {
          console.error("Error fetching profiles with reservations:", reservationsError);
          setError(`Erreur lors de la récupération des profils avec réservations: ${reservationsError.message}`);
          setLoading(false);
          return;
        }

        if (!profilesWithReservations || (Array.isArray(profilesWithReservations) && profilesWithReservations.length === 0)) {
          setProfiles([]);
          setLoading(false);
          return;
        }

        let profilesQuery = supabase.from("profiles").select("*");

        if (Array.isArray(profilesWithReservations)) {
          profilesQuery = profilesQuery.in('id', profilesWithReservations);
        }

        if (searchQuery) {
          profilesQuery = profilesQuery.ilike("last_name", `%${searchQuery}%`);
        }

        if (automaticPaymentFilter !== "all") {
          profilesQuery = profilesQuery.eq("automatic_payment", automaticPaymentFilter);
        }

        if (waitingFilter !== "all") {
          profilesQuery = profilesQuery.eq("is_waiting", waitingFilter);
        }

        if (closedFilter !== "all") {
          profilesQuery = profilesQuery.eq("is_closed", closedFilter);
        }

        profilesQuery = profilesQuery.order("last_name", { ascending: true });

        const { data: profilesData, error: profilesError } = await profilesQuery;

        if (profilesError) {
          console.error("Error fetching filtered profiles:", profilesError);
          setError(`Erreur lors de la récupération des profils: ${profilesError.message}`);
          setLoading(false);
          return;
        }

        const profilesWithEmails = profilesData?.map(profile => ({
          ...profile,
          email: ''
        })) || [];

        setProfiles(profilesWithEmails);
        setLoading(false);
        return;
      }

      // Standard case without reservation filter
      let profilesQuery = supabase.from("profiles").select("*");

      if (searchQuery) {
        profilesQuery = profilesQuery.ilike("last_name", `%${searchQuery}%`);
      }

      profilesQuery = profilesQuery.order("last_name", { ascending: true });

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

      const profilesWithEmails = profilesData?.map(profile => ({
        ...profile,
        email: ''
      })) || [];
      
      setProfiles(profilesWithEmails);
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
  }, [automaticPaymentFilter, waitingFilter, closedFilter, hasReservationsFilter, searchQuery]);

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
  };
};
