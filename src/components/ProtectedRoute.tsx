
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        
        if (requireAdmin) {
          console.log("Checking admin role for protected route");
          const { data: adminResult, error: adminError } = await supabase
            .rpc('is_admin', { user_id: session.user.id });

          if (adminError) {
            console.error("Error checking admin status in ProtectedRoute:", adminError);
            setIsAdmin(false);
          } else {
            console.log("Admin check result in ProtectedRoute:", adminResult);
            setIsAdmin(!!adminResult);
            
            // Mettre à jour le cache de react-query avec le statut admin
            queryClient.setQueryData(['admin-status'], !!adminResult);
          }
        }
        
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
  }, [location.pathname, toast, queryClient, requireAdmin, authChecked]);

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

  if (requireAdmin && !isAdmin) {
    console.log("User is not admin, redirecting to admin login");
    return <Navigate to="/admin-login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
