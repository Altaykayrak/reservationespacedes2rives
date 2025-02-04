
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProtectedRouteProps {
  children: React.ReactNode;
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
        // For admin routes
        if (location.pathname.startsWith('/admin')) {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session?.user) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }

          // Vérifier si l'utilisateur est admin
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .maybeSingle();

          setIsAuthenticated(roleData?.role === 'admin');
          setLoading(false);
          return;
        } 

        // For user routes
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          if (error.message.includes("Failed to fetch")) {
            setConnectionError(true);
            toast({
              title: "Erreur de connexion",
              description: "Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.",
              variant: "destructive",
            });
          } else if (error.message.includes("refresh_token_not_found")) {
            // Clear any stale session data and cache
            await handleLogout();
            toast({
              title: "Session expirée",
              description: "Votre session a expiré. Veuillez vous reconnecter.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erreur d'authentification",
              description: "Veuillez vous reconnecter.",
              variant: "destructive",
            });
          }
          return;
        }
        
        if (session) {
          setIsAuthenticated(true);
        } else {
          // If no session, clear cache and local data
          await handleLogout();
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

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      if (event === 'SIGNED_OUT') {
        await handleLogout();
      } else if (event === 'SIGNED_IN') {
        // Pour les routes admin, vérifier le rôle
        if (location.pathname.startsWith('/admin')) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session?.user.id)
            .eq('role', 'admin')
            .maybeSingle();

          setIsAuthenticated(roleData?.role === 'admin');
        } else {
          setIsAuthenticated(true);
        }
        // Reset query cache on sign in to ensure fresh data
        queryClient.resetQueries();
      }
    });

    checkAuth();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname, toast, queryClient]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    queryClient.clear(); // Clear all queries from cache
    setIsAuthenticated(false);
  };

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
    // Redirect to appropriate login page based on route
    return location.pathname.startsWith('/admin') ? 
      <Navigate to="/admin-login" replace /> :
      <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
