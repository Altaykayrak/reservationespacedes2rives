
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
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
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log(`ProtectedRoute: Checking auth for path ${location.pathname}, requireAdmin=${requireAdmin}`);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        // Vérifier si l'utilisateur est authentifié
        if (!session?.user) {
          console.log("No active session found in ProtectedRoute");
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        console.log("Session active trouvée dans ProtectedRoute:", session.user.id);
        setIsAuthenticated(true);
        
        // Si nous avons besoin de vérifier le rôle admin
        if (requireAdmin) {
          console.log("Vérification du rôle admin pour l'utilisateur:", session.user.id);
          const { data: adminResult, error: adminError } = await supabase
            .rpc('is_admin', { user_id: session.user.id });

          if (adminError) {
            console.error("Erreur lors de la vérification du rôle admin:", adminError);
            setIsAdmin(false);
          } else {
            console.log("Résultat de la vérification admin:", adminResult);
            setIsAdmin(!!adminResult);
            
            // Mettre à jour le cache de react-query avec le statut admin
            queryClient.setQueryData(['admin-status'], !!adminResult);
          }
          setAdminCheckComplete(true);
        }
        
        setLoading(false);
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
      console.log("Auth state changed in ProtectedRoute:", event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsAdmin(false);
        queryClient.clear();
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        queryClient.resetQueries();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname, toast, queryClient, requireAdmin]);

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

  // Vérifier les permissions admin si nécessaire
  if (requireAdmin) {
    // Attendre que la vérification admin soit terminée
    if (!adminCheckComplete) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des droits d'accès...</p>
        </div>
      </div>;
    }

    // Si l'utilisateur n'est pas admin, rediriger
    if (!isAdmin) {
      console.log("L'utilisateur n'est pas admin, redirection vers admin-login");
      return <Navigate to="/admin-login" replace />;
    }
  }

  // Return either the children prop if it's provided or render the Outlet for route nesting
  return children ? <>{children}</> : <Outlet />;
};
