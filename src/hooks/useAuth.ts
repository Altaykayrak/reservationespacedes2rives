
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const authSubscription = useRef<{ data: { subscription: any } } | null>(null);

  // Fonction pour gérer le changement d'état d'authentification
  const handleAuthStateChange = useCallback((event: string, session: Session | null) => {
    console.log("useAuth: Changement d'état d'authentification:", event, session?.user?.email || "pas de session");
    
    if (event === "INITIAL_SESSION") {
      console.log("useAuth: Session initiale détectée");
    }
    
    if (event === "SIGNED_IN") {
      console.log("useAuth: Event d'authentification positif détecté avec session");
    }
    
    if (event === "SIGNED_OUT") {
      console.log("useAuth: Event de déconnexion détecté");
      setUser(null);
      // Supprimer les données de session du localStorage
      localStorage.removeItem("sb-dddtybmradplydzymrly-auth-token");
    }
    
    // Ne pas modifier l'état user lors d'un SIGNED_OUT car nous voulons gérer cela séparément
    if (event !== "SIGNED_OUT") {
      setUser(session?.user || null);
    }
    
    setLoading(false);
  }, []);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    console.log("useAuth: Vérification de la session existante...");
    
    // Connexion à l'event listener pour les changements d'états d'authentification
    const setupAuthSubscription = async () => {
      if (authSubscription.current) {
        return; // Éviter les abonnements multiples
      }
      
      // Configuration de l'écouteur d'événements d'authentification
      authSubscription.current = supabase.auth.onAuthStateChange(handleAuthStateChange);
      
      // Récupération de la session actuelle
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("useAuth: Session trouvée:", session.user.email);
          setUser(session.user);
        } else {
          console.log("useAuth: Aucune session active");
          setUser(null);
          // Nettoyage explicite du localStorage pour éviter les sessions partielles
          localStorage.removeItem("sb-dddtybmradplydzymrly-auth-token");
        }
      } catch (error) {
        console.error("useAuth: Erreur lors de la récupération de la session:", error);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    
    setupAuthSubscription();
    
    // Nettoyage de la souscription
    return () => {
      if (authSubscription.current) {
        const { data: { subscription } } = authSubscription.current;
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
        authSubscription.current = null;
      }
    };
  }, [handleAuthStateChange]);

  // Fonction pour se déconnecter
  const signOut = async () => {
    console.log("useAuth: Déconnexion en cours...");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("useAuth: Erreur lors de la déconnexion:", error);
        throw error;
      }
      
      // Nettoyage explicite après déconnexion
      setUser(null);
      localStorage.removeItem("sb-dddtybmradplydzymrly-auth-token");
      console.log("useAuth: Déconnexion réussie, token supprimé du localStorage");
      
      // Ne plus rediriger automatiquement
      setLoading(false);
    } catch (error) {
      console.error("useAuth: Erreur inattendue lors de la déconnexion:", error);
      setLoading(false);
    }
  };

  return { user, loading, signOut, initialized };
};
