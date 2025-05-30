
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfilesActions = (refetchProfiles: () => void) => {
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const handleAutomaticPaymentChange = useCallback(async (id: string, automatic_payment: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ automatic_payment: !automatic_payment })
      .eq("id", id);

    if (error) {
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } else {
      refetchProfiles();
      toast.success("Profil mis à jour avec succès!");
    }
  }, [refetchProfiles]);

  const handleWaitingChange = useCallback(async (id: string, is_waiting: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_waiting: !is_waiting })
      .eq("id", id);

    if (error) {
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } else {
      refetchProfiles();
      toast.success("Profil mis à jour avec succès!");
    }
  }, [refetchProfiles]);

  const handleClosedChange = useCallback(async (id: string, is_closed: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_closed: !is_closed })
      .eq("id", id);

    if (error) {
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } else {
      refetchProfiles();
      toast.success("Profil mis à jour avec succès!");
    }
  }, [refetchProfiles]);

  const handleRdvAccessChange = useCallback(async (id: string, hide_rdv_access: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ hide_rdv_access: !hide_rdv_access })
      .eq("id", id);

    if (error) {
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } else {
      refetchProfiles();
      toast.success("Accès RDV mis à jour avec succès!");
    }
  }, [refetchProfiles]);

  const handleWednesdayAccessChange = useCallback(async (id: string, hide_wednesday_access: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ hide_wednesday_access: !hide_wednesday_access })
      .eq("id", id);

    if (error) {
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } else {
      refetchProfiles();
      toast.success("Accès Mercredis mis à jour avec succès!");
    }
  }, [refetchProfiles]);

  const handleBulkWaitingChange = useCallback(async (value: boolean) => {
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_waiting: value })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all profiles

      if (error) {
        toast.error(`Erreur lors de la mise à jour des profils: ${error.message}`);
      } else {
        refetchProfiles();
        toast.success(`Tous les profils ont été mis ${value ? 'en attente' : 'hors attente'} avec succès!`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Erreur: ${error.message}`);
      }
    } finally {
      setBulkActionLoading(false);
    }
  }, [refetchProfiles]);

  const handleBulkClosedChange = useCallback(async (value: boolean) => {
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_closed: value })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all profiles

      if (error) {
        toast.error(`Erreur lors de la mise à jour des profils: ${error.message}`);
      } else {
        refetchProfiles();
        toast.success(`Tous les profils ont été ${value ? 'fermés' : 'ouverts'} avec succès!`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Erreur: ${error.message}`);
      }
    } finally {
      setBulkActionLoading(false);
    }
  }, [refetchProfiles]);

  const handleBulkRdvAccessChange = useCallback(async (value: boolean) => {
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ hide_rdv_access: value })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all profiles

      if (error) {
        toast.error(`Erreur lors de la mise à jour des profils: ${error.message}`);
      } else {
        refetchProfiles();
        toast.success(`L'accès RDV a été ${value ? 'masqué' : 'affiché'} pour tous les profils avec succès!`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Erreur: ${error.message}`);
      }
    } finally {
      setBulkActionLoading(false);
    }
  }, [refetchProfiles]);

  const handleBulkWednesdayAccessChange = useCallback(async (value: boolean) => {
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ hide_wednesday_access: value })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all profiles

      if (error) {
        toast.error(`Erreur lors de la mise à jour des profils: ${error.message}`);
      } else {
        refetchProfiles();
        toast.success(`L'accès Mercredis a été ${value ? 'masqué' : 'affiché'} pour tous les profils avec succès!`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Erreur: ${error.message}`);
      }
    } finally {
      setBulkActionLoading(false);
    }
  }, [refetchProfiles]);

  return {
    bulkActionLoading,
    handleAutomaticPaymentChange,
    handleWaitingChange,
    handleClosedChange,
    handleRdvAccessChange,
    handleWednesdayAccessChange,
    handleBulkWaitingChange,
    handleBulkClosedChange,
    handleBulkRdvAccessChange,
    handleBulkWednesdayAccessChange,
  };
};
