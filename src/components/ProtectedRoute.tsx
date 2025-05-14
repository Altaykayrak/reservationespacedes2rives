
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Vérifier si c'est une route admin
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  useEffect(() => {
    // Si c'est une route admin, ne pas vérifier l'authentification
    if (isAdminRoute) {
      console.log("Route admin détectée, accès autorisé sans vérification");
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    // Pour les routes non-admin, vérifier l'authentification
    const checkAuth = async () => {
      try {
        console.log("Vérification de la session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        console.log("État de la session:", session ? "Authentifié" : "Non authentifié");
        
        if (session) {
          console.log("Session active trouvée, utilisateur authentifié");
          setIsAuthenticated(true);
        } else {
          console.log("Aucune session active trouvée");
          setIsAuthenticated(false);
        }
        
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

    // Configuration explicite des options du client Supabase
    const setupSupabaseAuth = async () => {
      console.log("Configuration de Supabase Auth...");
      // Ici, nous nous assurons que les options de persistance sont correctement configurées
      // Cette étape est implicitement gérée par le client Supabase, mais nous la mentionnons pour clarté
    };

    setupSupabaseAuth();
    checkAuth();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("ProtectedRoute - Auth state changed:", event, session ? "Session présente" : "Session absente");
      
      // Les routes admin sont toujours accessibles
      if (isAdminRoute) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }
      
      if (event === 'SIGNED_OUT') {
        console.log("SIGNED_OUT event détecté");
        setIsAuthenticated(false);
        queryClient.clear();
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session) {
        console.log("Event d'authentification positif détecté avec session");
        setIsAuthenticated(true);
        queryClient.resetQueries();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname, toast, queryClient, isAdminRoute]);

  if (loading && !isAdminRoute) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>;
  }

  if (connectionError && !isAdminRoute) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-4">
        <p className="text-red-600 mb-2">Erreur de connexion au serveur</p>
        <p className="text-gray-600">Veuillez vérifier votre connexion internet et rafraîchir la page.</p>
      </div>
    </div>;
  }

  // Routes administratives sont toujours accessibles sans authentification
  if (isAdminRoute) {
    console.log("Accès admin autorisé sans authentification");
    return children ? <>{children}</> : <Outlet />;
  }

  // Pour les routes utilisateur, vérifier l'authentification
  if (!isAuthenticated) {
    console.log("Utilisateur non authentifié, redirection vers /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("Accès autorisé à la route protégée:", location.pathname);
  // Return either the children prop if it's provided or render the Outlet for route nesting
  return children ? <>{children}</> : <Outlet />;
};
