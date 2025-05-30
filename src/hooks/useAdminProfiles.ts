
import { useEffect } from "react";
import { useProfilesFilters } from "@/hooks/admin/useProfilesFilters";
import { useProfilesData } from "@/hooks/admin/useProfilesData";
import { useProfilesActions } from "@/hooks/admin/useProfilesActions";

export const useAdminProfiles = () => {
  const {
    filters,
    automaticPaymentFilter,
    setAutomaticPaymentFilter,
    waitingFilter,
    setWaitingFilter,
    closedFilter,
    setClosedFilter,
    hasReservationsFilter,
    setHasReservationsFilter,
    searchQuery,
    setSearchQuery,
  } = useProfilesFilters();

  const {
    profiles,
    loading,
    error,
    fetchProfiles,
  } = useProfilesData(filters);

  const {
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
  } = useProfilesActions(fetchProfiles);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

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
    hasReservationsFilter,
    setHasReservationsFilter,
    searchQuery,
    setSearchQuery,
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
