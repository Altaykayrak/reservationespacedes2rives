
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
    // Wait for all data to be loaded before making decisions
    if (!authLoading && !gLoad && !uLoad) {
      console.log("ProtectedRoute: All data loaded, authentication status:", isAuthenticated);
      setChecking(false);
    }
  }, [authLoading, gLoad, uLoad, isAuthenticated]);

  // Show loading state while checking
  if (checking || authLoading) {
    console.log("ProtectedRoute: Still checking authentication...");
    return <Skeleton className="h-32 w-full" />;
  }

  console.log("ProtectedRoute: Path:", location.pathname, "Auth status:", isAuthenticated);

  // Check if the current page is blocked based on settings
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

  // If the page is blocked by settings, redirect to home
  if (isBlocked(location.pathname)) {
    console.log("ProtectedRoute: Page is blocked by settings, redirecting to home");
    return <Navigate to="/" replace />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // User is authenticated and page is not blocked, render the children
  console.log("ProtectedRoute: User is authenticated, rendering children");
  return <>{children}</>;
}
