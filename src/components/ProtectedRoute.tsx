import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // For admin routes
      if (location.pathname.startsWith('/admin')) {
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession === 'true') {
          setIsAuthenticated(true);
        }
      } 
      // For user routes
      else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [location.pathname]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on route
    return location.pathname.startsWith('/admin') ? 
      <Navigate to="/admin-login" replace /> :
      <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};