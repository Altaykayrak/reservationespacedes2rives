import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if admin is logged in
      const adminSession = localStorage.getItem('adminSession');
      
      if (adminSession === 'true') {
        setIsAuthenticated(true);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};