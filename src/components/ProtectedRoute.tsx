
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
        // Pour les routes admin, toujours autoriser l'accès sans vérification
        if (location.pathname.startsWith('/admin')) {
          console.log("Route admin détectée, accès autorisé sans vérification");
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        // Pour les autres routes, vérifier l'authentification
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        console.log("État de la session:", session ? "Authentifié" : "Non authentifié");
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

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("ProtectedRoute - Auth state changed:", event, session ? "Session présente" : "Session absente");
      
      // Les routes admin sont toujours accessibles sans authentification
      if (location.pathname.startsWith('/admin')) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        queryClient.clear();
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        queryClient.resetQueries();
      }
    });

    checkAuth();

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

  // Routes administratives sont toujours accessibles sans authentification
  if (location.pathname.startsWith('/admin')) {
    console.log("Accès admin autorisé sans authentification");
    return children ? <>{children}</> : <Outlet />;
  }

  // Pour les routes utilisateur, vérifier l'authentification
  if (!isAuthenticated) {
    console.log("Utilisateur non authentifié, redirection vers /login");
    return <Navigate to="/login" replace />;
  }

  console.log("Accès autorisé à la route protégée:", location.pathname);
  // Return either the children prop if it's provided or render the Outlet for route nesting
  return children ? <>{children}</> : <Outlet />;
};
