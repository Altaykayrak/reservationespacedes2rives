
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminProfiles } from "@/hooks/useAdminProfiles";
import { AdminProfilesFilters } from "@/components/admin/profiles/AdminProfilesFilters";
import { AdminProfilesActions } from "@/components/admin/profiles/AdminProfilesActions";
import { AdminProfilesTable } from "@/components/admin/profiles/AdminProfilesTable";
import { AdminProfilesStatus } from "@/components/admin/profiles/AdminProfilesStatus";

const AdminProfiles = () => {
  const {
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
  } = useAdminProfiles();

  return (
    <div className="container mx-auto py-10 space-y-6">
      <AdminProfilesActions
        profiles={profiles}
        bulkActionLoading={bulkActionLoading}
        handleBulkWaitingChange={handleBulkWaitingChange}
        handleBulkClosedChange={handleBulkClosedChange}
        handleBulkRdvAccessChange={handleBulkRdvAccessChange}
        handleBulkWednesdayAccessChange={handleBulkWednesdayAccessChange}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminProfilesFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            automaticPaymentFilter={automaticPaymentFilter}
            setAutomaticPaymentFilter={setAutomaticPaymentFilter}
            waitingFilter={waitingFilter}
            setWaitingFilter={setWaitingFilter}
            closedFilter={closedFilter}
            setClosedFilter={setClosedFilter}
            hasReservationsFilter={hasReservationsFilter}
            setHasReservationsFilter={setHasReservationsFilter}
          />

          <AdminProfilesStatus loading={loading} error={error} />

          {!loading && !error && (
            <AdminProfilesTable
              profiles={profiles}
              handleAutomaticPaymentChange={handleAutomaticPaymentChange}
              handleWaitingChange={handleWaitingChange}
              handleClosedChange={handleClosedChange}
              handleRdvAccessChange={handleRdvAccessChange}
              handleWednesdayAccessChange={handleWednesdayAccessChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfiles;
