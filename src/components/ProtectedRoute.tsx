
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin";
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        // For admin routes
        if (requiredRole === 'admin') {
          if (!session?.user) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }

          // Check admin status using RPC function
          const { data: isAdmin, error: adminError } = await supabase
            .rpc('is_admin', { user_id: session.user.id });

          if (adminError) {
            console.error("Error checking admin role:", adminError);
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(isAdmin);
          }
          
          setLoading(false);
          return;
        } 

        // For user routes
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
      console.log("Auth state changed:", event, session);
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        queryClient.clear();
      } else if (event === 'SIGNED_IN' && session) {
        if (requiredRole === 'admin') {
          const { data: isAdmin } = await supabase
            .rpc('is_admin', { user_id: session.user.id });

          setIsAuthenticated(isAdmin);
        } else {
          setIsAuthenticated(true);
        }
        queryClient.resetQueries();
      }
    });

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname, toast, queryClient, requiredRole]);

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
    return requiredRole === 'admin' ? 
      <Navigate to="/admin/login" replace /> :
      <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
