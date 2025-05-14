
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Vérifier si l'utilisateur est sur une route admin
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Récupérer la session initiale
    const initializeAuth = async () => {
      // Pour les routes admin, ne pas vérifier l'authentification
      if (isAdminRoute) {
        console.log("Route admin détectée dans useAuth, authentification ignorée");
        setLoading(false);
        return;
      }

      try {
        console.log("useAuth: Vérification de la session existante...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la récupération de la session:", error);
          setUser(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log("useAuth: Session trouvée:", session.user);
          setUser(session.user);
        } else {
          console.log("useAuth: Aucune session active");
          setUser(null);
        }
      } catch (error) {
        console.error("Erreur d'initialisation de l'auth:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // S'abonner aux changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("useAuth: Changement d'état d'authentification:", event, session?.user);
      
      // Pour les routes admin, ignorer les événements d'authentification
      if (isAdminRoute) {
        console.log("useAuth: Route admin détectée, ignorer l'événement d'authentification");
        return;
      }
      
      if (event === 'SIGNED_OUT') {
        console.log("useAuth: SIGNED_OUT détecté");
        setUser(null);
        
        // Ne pas rediriger automatiquement lors de la déconnexion
        // sauf si l'utilisateur est sur une page protégée qui n'est pas une page admin
        if (!isAdminRoute && !isPublicPage(location.pathname)) {
          console.log("useAuth: Redirection après déconnexion");
          navigate('/login', { replace: true });
        }
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
        console.log("useAuth: Event d'authentification positif détecté avec session");
        setUser(session.user);
        
        // Ne rediriger que si l'utilisateur est sur la page de login
        if (location.pathname === '/login') {
          console.log("useAuth: Sur page login avec session, redirection vers profile");
          navigate('/profile', { replace: true });
        }
      } else if (!session) {
        console.log("useAuth: Pas de session détectée dans l'événement");
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, location.pathname, isAdminRoute]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      // Vider le localStorage pour s'assurer qu'il n'y a pas de données résiduelles
      localStorage.removeItem("supabase.auth.token");
      
      navigate('/login', { replace: true });
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  // Fonction utilitaire pour vérifier si la page est publique
  const isPublicPage = (path: string) => {
    const publicPages = [
      '/login', 
      '/', 
      '/prices', 
      '/terms-of-operation', 
      '/holiday-program',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/admin-login'
    ];
    return publicPages.some(page => path === page) || path.startsWith('/admin');
  };

  return {
    user,
    loading,
    signOut,
  };
}
