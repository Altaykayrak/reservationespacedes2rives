
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [checking, setChecking] = useState(true);
  const location = useLocation();
  const { globalSettings, loading: gLoad } = useGlobalSettings();
  const { userSettings, loading: uLoad } = useUserSettings();

  useEffect(() => {
    if (!authLoading && !gLoad && !uLoad) setChecking(false);
  }, [authLoading, gLoad, uLoad]);

  if (checking) return <Skeleton className="h-32 w-full" />;

  const isBlocked = (path: string) => {
    if (path === "/wednesday-reservations") {
      return (
        globalSettings.hide_wednesday_reservations ||
        userSettings.hide_wednesday_reservations
      );
    }
    if (path === "/rdv") {
      return (
        globalSettings.hide_rdv_page || 
        userSettings.hide_rdv_page
      );
    }
    return false;
  };

  if (isBlocked(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
