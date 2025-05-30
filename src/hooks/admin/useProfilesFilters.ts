
import { useState, useMemo } from "react";

export const useProfilesFilters = () => {
  const [automaticPaymentFilter, setAutomaticPaymentFilter] = useState<"all" | boolean>("all");
  const [waitingFilter, setWaitingFilter] = useState<"all" | boolean>("all");
  const [closedFilter, setClosedFilter] = useState<"all" | boolean>("all");
  const [hasReservationsFilter, setHasReservationsFilter] = useState<"all" | boolean>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Memoize filters to prevent unnecessary re-renders
  const filters = useMemo(() => ({
    automaticPaymentFilter,
    waitingFilter,
    closedFilter,
    hasReservationsFilter,
    searchQuery
  }), [automaticPaymentFilter, waitingFilter, closedFilter, hasReservationsFilter, searchQuery]);

  return {
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
  };
};
