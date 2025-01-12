import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // For admin routes
        if (location.pathname.startsWith('/admin')) {
          const adminSession = localStorage.getItem('adminSession');
          if (adminSession === 'true') {
            setIsAuthenticated(true);
          }
        } 
        // For user routes
        else {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error("Auth error:", error);
            toast({
              title: "Erreur d'authentification",
              description: "Veuillez vous reconnecter.",
              variant: "destructive",
            });
            return;
          }
          
          if (session) {
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        toast({
          title: "Erreur de connexion",
          description: "Un problème est survenu lors de la vérification de votre connexion.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname, toast]);

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