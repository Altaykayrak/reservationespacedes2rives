
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Si le chemin commence par /admin, nous permettons l'accès sans vérification
  if (location.pathname.startsWith('/admin')) {
    return children ? <>{children}</> : <Outlet />;
  }

  useEffect(() => {
    // Une seule vérification par rendu
    if (authChecked) return;

    const checkAuth = async () => {
      try {
        console.log(`ProtectedRoute: Checking auth for path ${location.pathname}`);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log("No active session found in ProtectedRoute");
          setIsAuthenticated(false);
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        console.log("Active session found in ProtectedRoute:", session.user.id);
        setIsAuthenticated(true);
        setLoading(false);
        setAuthChecked(true);
      } catch (error) {
        console.error("Auth check error:", error);
        setLoading(false);
        setAuthChecked(true);
        toast({
          title: "Erreur de connexion",
          description: "Un problème est survenu lors de la vérification de votre connexion.",
          variant: "destructive",
        });
      }
    };

    checkAuth();
  }, [location.pathname, toast, queryClient, authChecked]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>;
  }

  if (!isAuthenticated) {
    return location.pathname.startsWith('/admin') ? 
      <Navigate to="/admin-login" replace /> :
      <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
