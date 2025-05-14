
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

  useEffect(() => {
    // Configurer le client Supabase explicitement
    const supabaseClient = supabase;

    // Récupérer la session initiale
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la récupération de la session:", error);
          setUser(null);
          return;
        }

        if (session?.user) {
          console.log("Session trouvée:", session.user);
          setUser(session.user);
        } else {
          console.log("Aucune session active");
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
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log("Changement d'état d'authentification:", event, session?.user);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        
        // Ne pas rediriger automatiquement lors de la déconnexion
        // sauf si l'utilisateur est sur une page protégée qui n'est pas une page admin
        if (!location.pathname.startsWith('/admin') && 
            !isPublicPage(location.pathname)) {
          navigate('/login');
        }
      } else if (session?.user) {
        setUser(session.user);
        
        // Ne rediriger que si l'utilisateur est sur la page de login
        if (location.pathname === '/login') {
          navigate('/profile');
        }
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, location.pathname]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      // Vider le localStorage pour s'assurer qu'il n'y a pas de données résiduelles
      localStorage.clear();
      
      navigate('/login');
      
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
      '/reset-password'
    ];
    return publicPages.some(page => path === page) || path.startsWith('/admin');
  };

  return {
    user,
    loading,
    signOut,
  };
}
