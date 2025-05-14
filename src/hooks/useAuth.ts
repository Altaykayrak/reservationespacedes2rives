
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
    // Récupérer la session initiale
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la récupération de la session:", error);
          await supabase.auth.signOut();
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
        await supabase.auth.signOut();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // S'abonner aux changements d'état d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Changement d'état d'authentification:", event, session?.user);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        // Ne pas rediriger si l'URL commence par /admin
        if (!location.pathname.startsWith('/admin')) {
          navigate('/login');
        }
      } else if (session?.user) {
        setUser(session.user);
        // Ne pas rediriger si l'URL commence par /admin
        if (!location.pathname.startsWith('/admin') && location.pathname === '/login') {
          navigate('/profile');
        }
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, location]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      // Vider le localStorage pour s'assurer qu'il n'y a pas de données résiduelles
      localStorage.clear();
      
      // Ne pas rediriger si l'URL commence par /admin
      if (!location.pathname.startsWith('/admin')) {
        navigate('/login');
      }
      
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

  return {
    user,
    loading,
    signOut,
  };
}
