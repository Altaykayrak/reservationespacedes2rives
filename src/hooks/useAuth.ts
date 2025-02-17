
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer la session initiale
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la récupération de la session:", error);
          // En cas d'erreur de session, on déconnecte l'utilisateur
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
        // En cas d'erreur, on déconnecte l'utilisateur
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
      
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        setUser(null);
        // Rediriger vers la page de connexion uniquement si nous ne sommes pas déjà sur /login
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      } else if (session?.user) {
        setUser(session.user);
        // Si l'utilisateur est sur /login et qu'il est authentifié, le rediriger vers /profile
        if (window.location.pathname === '/login') {
          navigate('/profile');
        }
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

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

  return {
    user,
    loading,
    signOut,
  };
}
