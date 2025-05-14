
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProtectedRouteProps {
  children?: React.ReactNode; // Make children optional
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("ProtectedRoute: Checking auth for path", location.pathname);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        // Pour les routes admin
        if (location.pathname.startsWith('/admin')) {
          if (!session?.user) {
            console.log("No active session found in ProtectedRoute for admin route");
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }

          // Si c'est une route admin, on laisse AdminPage faire la vérification d'admin
          // Cela évite la double vérification et les potentielles boucles
          setIsAuthenticated(true);
          
          setLoading(false);
          return;
        } 

        // Pour les routes utilisateur normales
        setIsAuthenticated(!!session);
        
      } catch (error) {
        console.error("Auth check error:", error);
        setConnectionError(true);
        toast({
          title: "Erreur de connexion",
          description: "Un problème est survenu lors de la vérification de votre connexion.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Effectuer la vérification initiale d'authentification
    checkAuth();

    // S'abonner aux changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        queryClient.clear();
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        queryClient.resetQueries();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname, toast, queryClient]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>;
  }

  if (connectionError) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-4">
        <p className="text-red-600 mb-2">Erreur de connexion au serveur</p>
        <p className="text-gray-600">Veuillez vérifier votre connexion internet et rafraîchir la page.</p>
      </div>
    </div>;
  }

  if (!isAuthenticated) {
    return location.pathname.startsWith('/admin') ? 
      <Navigate to="/admin-login" replace /> :
      <Navigate to="/login" replace />;
  }

  // Return either the children prop if it's provided or render the Outlet for route nesting
  return children ? <>{children}</> : <Outlet />;
};
